import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardHashtag } from 'src/boards-hashtags/entities/board-hashtag.entity';
import { BoardsService } from 'src/boards/boards.service';
import { Board } from 'src/boards/entities/board.entity';
import { Connection, Repository } from 'typeorm';
import { Hashtag } from './entities/hashtag.entity';

@Injectable()
export class HashtagsService {
  constructor(
    @InjectRepository(Hashtag)
    private readonly hashtagsRepository: Repository<Hashtag>,
    @InjectRepository(BoardHashtag)
    private readonly boardsHashtagsRepository: Repository<BoardHashtag>,
    private readonly boardsService: BoardsService,
    private readonly connection: Connection,
  ) {}

  /**
   * 게시글 번호와 연관된 모든 해시태그를 삭제
   */
  async deleteAllByBoardId(boardId: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const board: Board = await this.boardsService.getDetail(boardId);
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

  /**
   * 게시글 번호와 해시태그 배열로 BoardHashtag 테이블에 저장
   */
  async saveAllByBoardId(boardId: number, hashtags: string[]) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const board: Board = await this.boardsService.getDetail(boardId);
      hashtags.forEach(async (hashtag) => {
        const savedHashtag: Hashtag = await this.hashtagsRepository.save({
          name: hashtag,
        });
        await this.boardsHashtagsRepository.save({
          board,
          hashtag: savedHashtag,
        });
      });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        '게시글 번호에 해당하는 해시태그 저장을 실패했습니다.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
