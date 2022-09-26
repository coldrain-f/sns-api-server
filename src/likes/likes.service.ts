import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardsService } from 'src/boards/boards.service';
import { Board } from 'src/boards/entities/board.entity';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like) private readonly likesRepository: Repository<Like>,
    private readonly boardsService: BoardsService,
  ) {}

  async getLikeCountByBoardId(boardId: number) {
    const board: Board = await this.boardsService.getDetail(boardId);
    const likes: Like[] = await this.likesRepository.find({ where: { board } });
    return likes.length;
  }
}
