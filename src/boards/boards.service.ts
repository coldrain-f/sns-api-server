import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { string } from 'joi';
import { BoardHashtag } from 'src/boards-hashtags/entities/board-hashtag.entity';
import { Hashtag } from 'src/hashtags/entities/hashtag.entity';
import { LikesService } from 'src/likes/likes.service';
import { User } from 'src/users/entities/users.entity';
import {
  Connection,
  FindOneOptions,
  FindOptionsOrder,
  Like,
  Repository,
} from 'typeorm';
import { BoardSearchCondition } from './dto/board-search-condition.dto';
import { CreateBoardDTO } from './dto/create-board.dto';
import { UpdateBoardDTO } from './dto/update-board.dto';
import { Board } from './entities/board.entity';

export interface BoardDetailInfo {
  title: string;
  content: string;
  likeCount: number;
  views: number;
  hashtags: string[];
}

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardsRepository: Repository<Board>,
    @InjectRepository(Hashtag)
    private readonly hashtagsRepository: Repository<Hashtag>,
    @InjectRepository(BoardHashtag)
    private readonly boardsHashtagsRepository: Repository<BoardHashtag>,
    private readonly likesService: LikesService,
    private readonly connection: Connection,
  ) {}

  /**
   * 게시글 생성
   */
  async create(request: CreateBoardDTO, currentUser: User): Promise<number> {
    const { title, content, hashtags } = request;
    let savedBoard: Board;
    // Todo: Connection 사용이 deprecated 추후에 다른 방법으로 적용
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      savedBoard = await this.boardsRepository.save({
        title,
        content,
        user: currentUser,
      });

      // Todo: 해시태그가 없는 경우도 동작하는지 체크
      // Todo: 해시태그 유효성 검사
      this.addAllHashtag(hashtags, savedBoard);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('게시글 등록에 실패했습니다.');
    } finally {
      await queryRunner.release();
    }

    return savedBoard.id;
  }

  /**
   * 게시글 수정
   */
  async update(
    boardId: number,
    request: UpdateBoardDTO,
    currentUser: User,
  ): Promise<void> {
    const { title, content, hashtags } = request;
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const board: Board = await this.findOne({
        where: { id: boardId },
        relations: ['user'],
      });
      if (board.user.id !== currentUser.id) {
        throw new ForbiddenException();
      }
      board.title = title;
      board.content = content;

      // 게시글과 연관된 해시태그를 모두 제거하고 새로 집어넣는다.
      this.deleteAllBoardHashtag(board);
      this.addAllHashtag(hashtags, board);

      await this.boardsRepository.save(board);
      await queryRunner.commitTransaction();
    } catch (err) {
      // Todo: Exception에 따라서 분기할 수 있는 방법 찾아보기
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('게시글 수정에 실패했습니다.');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 게시글 삭제
   */
  async delete(boardId: number, currentUser: User): Promise<void> {
    const board = await this.findOne({
      where: { id: boardId },
      relations: ['user'],
    });
    board.isDeleted = true;

    if (board.user.id !== currentUser.id) {
      throw new ForbiddenException('자신의 게시글만 삭제할 수 있습니다.');
    }

    await this.boardsRepository.save(board);
  }

  /**
   * 게시글 상세보기
   */
  async getDetail(boardId: number): Promise<BoardDetailInfo> {
    const board: Board = await this.findOne({
      where: { id: boardId },
      relations: ['boardHashtags', 'likes'],
    });

    board.views = await this.incrementViews(board);
    board.likeCount = await this.likesService.getLikeCountByBoardId(boardId);
    // 해시태그 만들어서 배열로 설정
    const boardHashtags: BoardHashtag[] =
      await this.boardsHashtagsRepository.find({
        where: board,
        relations: ['hashtag'],
      });
    const hashtags: string[] = [];
    boardHashtags.forEach((bh) => hashtags.push(bh.hashtag.name));

    return {
      title: board.title,
      content: board.content,
      likeCount: board.likeCount,
      views: board.views,
      hashtags,
    };
  }

  /**
   * 게시글 목록 조회
   * 정렬: default 작성일 / 작성일, 좋아요 수, 조회수
   * 검색: 제목으로 검색
   * 필터링: 해시태그로 필터링
   * 페이징: 페이지당 deafult 10개
   */
  async getList(searchCondition: BoardSearchCondition) {
    const { page, size, sort, search } = searchCondition;
    const [sortKey, sortValue] = sort.split(',');
    const sortCondition = this.setupSortCondition(sortKey, sortValue);

    const boards: Board[] = await this.boardsRepository.find({
      where: { title: Like(`%${search}%`) },
      order: sortCondition,
      skip: (page - 1) * size, // 시작 페이지
      take: size, // 페이지 당 데이터 수 default 10
    });
    return boards;
  }

  /**
   * 기존 조회수에서 1증가
   */
  private async incrementViews(board: Board): Promise<number> {
    ++board.views;
    const savedBoard: Board = await this.boardsRepository.save(board);
    return savedBoard.views;
  }

  /**
   * 게시글 한 개 조회
   */
  private async findOne(options: FindOneOptions<Board>): Promise<Board> {
    const board = await this.boardsRepository.findOne(options);
    if (!board) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    if (board.isDeleted) {
      throw new BadRequestException('삭제된 게시글입니다.');
    }
    return board;
  }

  /**
   * 게시글에 해시태그 추가
   */
  private async addAllHashtag(hashtags: string, board: Board): Promise<void> {
    hashtags.split(',').forEach(async (hashtag) => {
      // 해시태그를 조회해 온다.
      const findHashtag = await this.hashtagsRepository.findOne({
        where: { name: hashtag },
      });

      let savedHashtag: Hashtag;
      // 조회해온 해시태그가 존재하지 않는다면 새로 저장
      if (!findHashtag) {
        savedHashtag = await this.hashtagsRepository.save({
          name: hashtag,
        });
      }

      // 존재한다면 조회해온 해시태그를 설정
      // 존재하지 않는다면 새로 저장한 해시태그를 설정
      await this.boardsHashtagsRepository.save({
        board,
        hashtag: findHashtag ? findHashtag : savedHashtag,
      });
    });
  }

  /**
   * 게시글 번호와 연관된 모든 해시태그를 삭제
   */
  private async deleteAllBoardHashtag(board: Board): Promise<void> {
    const boardHashtags: BoardHashtag[] =
      await this.boardsHashtagsRepository.find({ where: { board } });

    // 부모 제거 -> Hashtag
    boardHashtags.forEach(
      async (boardHashtag) =>
        await this.hashtagsRepository.remove(boardHashtag.hashtag),
    );

    // 부모가 없는 자식들 제거 -> BoardHashtag
    await this.boardsHashtagsRepository.remove(boardHashtags);
  }

  /**
   * 정렬 조건 설정
   */
  private setupSortCondition(
    key: string,
    value: string,
  ): FindOptionsOrder<Board> {
    let sortCondition: FindOptionsOrder<Board>;

    if (key === 'createdAt' && value === 'desc') {
      sortCondition = { createdAt: 'desc' };
    } else if (key === 'createdAt' && value === 'asc') {
      sortCondition = { createdAt: 'asc' };
    } else if (key === 'likeCount' && value === 'desc') {
      sortCondition = { likeCount: 'desc' };
    } else if (key === 'likeCount' && value === 'asc') {
      sortCondition = { likeCount: 'asc' };
    } else if (key === 'views' && value === 'desc') {
      sortCondition = { views: 'desc' };
    } else if (key === 'views' && value === 'asc') {
      sortCondition = { views: 'asc' };
    } else {
      throw new BadRequestException('정렬 조건을 다시 확인해 주세요.');
    }

    return sortCondition;
  }
}
