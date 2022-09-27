import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardsService } from 'src/boards/boards.service';
import { Board } from 'src/boards/entities/board.entity';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like) private readonly likesRepository: Repository<Like>,
    @InjectRepository(Board)
    private readonly boardsRepository: Repository<Board>,
  ) {}

  async getLikeCountByBoardId(boardId: number) {
    const board: Board = await this.boardsRepository.findOne({
      where: { id: boardId },
    });

    if (!board) {
      throw new BadRequestException('존재하지 얺는 게시글입니다.');
    }
    if (board.isDeleted) {
      throw new BadRequestException('삭제된 게시글입니다.');
    }

    const likes: Like[] = await this.likesRepository.find({ where: { board } });
    return likes.length;
  }
}
