import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardHashtag } from 'src/boards-hashtags/entities/board-hashtag.entity';
import { Hashtag } from 'src/hashtags/entities/hashtag.entity';
import { LikesService } from 'src/likes/likes.service';
import { Connection, FindOneOptions, Repository } from 'typeorm';
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
    private readonly hashtagsRepository: Repository<Hashtag>,
    private readonly boardsHashtagsRepository: Repository<BoardHashtag>,
    private readonly likesService: LikesService,
    private readonly connection: Connection,
  ) {}

  /**
   * 게시글 생성
   */
  async create(request: CreateBoardDTO): Promise<void> {
    const { title, content, hashtags } = request;
    // Todo: userId로 DB에서 User 조회
    // Todo: 해시태그 유효성 검사
    // Todo: Connection 사용이 deprecated 추후에 다른 방법으로 적용
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedBoard: Board = await this.boardsRepository.save({
        title,
        content,
        user: null,
      });

      this.addAllHashtag(hashtags, savedBoard);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('게시글 등록에 실패했습니다.');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 게시글 수정
   */
  async update(boardId: number, request: UpdateBoardDTO): Promise<void> {
    // Todo: 본인 게시글만 수정할 수 있도록 변경 필요
    const { title, content, hashtags } = request;
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Todo: 해시태그는 어떻게 할지 고민 필요
      // 게시글과 연관된 해시태그를 싹다 지우고 새로 집어넣는다.
      const board: Board = await this.findOne({ where: { id: boardId } });
      board.title = title;
      board.content = content;
      this.deleteAllHashtag(board);
      this.addAllHashtag(hashtags, board);

      await this.boardsRepository.save(board);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 게시글 삭제
   */
  async delete(boardId: number): Promise<void> {
    // Todo: 본인 게시글만 수정할 수 있도록 변경 필요
    const board = await this.findOne({ where: { id: boardId } });
    board.isDeleted = true;

    await this.boardsRepository.save(board);
  }

  /**
   * 게시글 상세보기
   */
  async getDetail(boardId: number): Promise<Board> {
    const board: Board = await this.findOne({
      where: { id: boardId },
      relations: ['boardHashtags', 'likes'],
    });

    board.views = await this.incrementViews(board);
    board.likeCount = await this.likesService.getLikeCountByBoardId(boardId);
    // 2. 해시태그 만들어서 배열로 설정

    // Todo: 상세보기 Response DTO 만들어서 내보내기
    return board;
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
  private async addAllHashtag(hashtags: string, board: Board) {
    hashtags.split(',').forEach(async (hashtag) => {
      const savedHashtag: Hashtag = await this.hashtagsRepository.save({
        name: hashtag,
      });
      await this.boardsHashtagsRepository.save({
        board,
        hashtag: savedHashtag,
      });
    });
  }

  /**
   * 게시글 번호와 연관된 모든 해시태그를 삭제
   */
  private async deleteAllHashtag(board: Board) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const boardHashtags: BoardHashtag[] =
        await this.boardsHashtagsRepository.find({ where: { board } });

      // 부모 제거 -> Hashtag
      boardHashtags.forEach(
        async (boardHashtag) =>
          await this.hashtagsRepository.remove(boardHashtag.hashtag),
      );

      // 부모가 없는 자식들 제거 -> BoardHashtag
      await this.boardsHashtagsRepository.remove(boardHashtags);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        '게시글 번호에 해당하는 해시태그 삭제를 실패했습니다.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
