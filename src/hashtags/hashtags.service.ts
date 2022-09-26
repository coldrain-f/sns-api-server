import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardHashtag } from 'src/boards-hashtags/entities/board-hashtag.entity';
import { BoardsService } from 'src/boards/boards.service';
import { Board } from 'src/boards/entities/board.entity';
import { Repository } from 'typeorm';
import { Hashtag } from './entities/hashtag.entity';

@Injectable()
export class HashtagsService {
  constructor(
    @InjectRepository(Hashtag)
    private readonly hashtagsRepository: Repository<Hashtag>,
    @InjectRepository(BoardHashtag)
    private readonly boardsHashtagsRepository: Repository<BoardHashtag>,
    private readonly boardsService: BoardsService,
  ) {}

  async deleteAllByBoardId(boardId: number) {
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
  }
}
