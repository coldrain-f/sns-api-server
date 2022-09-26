import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardHashtag } from 'src/boards-hashtags/entities/board-hashtag.entity';
import { Hashtag } from 'src/hashtags/entities/hashtag.entity';
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
    private readonly connection: Connection,
  ) {}

  /**
   * 게시글 생성
   */
  async create(request: CreateBoardDTO): Promise<void> {
    const { title, content, hashtags } = request;
    // Todo: userId로 DB에서 User 조회

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

      // Todo: 해시태그 유효성 검사
      hashtags.split(',').forEach(async (hashtag) => {
        const savedHashTag: Hashtag = await this.hashtagsRepository.save({
          name: hashtag,
        });
        await this.boardsHashtagsRepository.save({
          board: savedBoard,
          hashtag: savedHashTag,
        });
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      // Todo: throw err를 하는 경우에도 Nest가 자동으로 처리해주는지 체크
      await queryRunner.rollbackTransaction();
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
    const board: Board = await this.findOne({ where: { id: boardId } });
    board.title = title;
    board.content = content;
    // Todo: 해시태그는 어떻게 할지 고민 필요
    await this.boardsRepository.save(board);
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
    await this.incrementLikeCount(board);
    // Todo: 상세보기 Response DTO 만들어서 내보내기
    // 1. 좋아요 수 계산해서 설정
    // 2. 해시태그 만들어서 배열로 설정
    return board;
  }

  /**
   * 조회수 +1
   */
  private async incrementLikeCount(board: Board): Promise<void> {
    board.likeCount = board.likeCount + 1;
    await this.boardsRepository.save(board);
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
}
