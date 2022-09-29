import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from 'src/boards/entities/board.entity';
import { User } from 'src/users/entities/users.entity';
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
      where: { id: boardId, isDeleted: false },
    });

    if (!board) {
      throw new BadRequestException('존재하지 얺는 게시글입니다.');
    }

    const likes: Like[] = await this.likesRepository.find({ where: { board } });
    return likes.length;
  }

  /**
   * 해당 게시글에 좋아요를 눌렀는지 여부 반환
   */
  async isLike(user: User, board: Board) {
    const findLike: Like = await this.likesRepository.findOne({
      where: { user, board },
    });
    if (!findLike) {
      return false;
    }
    return true;
  }

  /**
   * 좋아요
   */
  async like(user: User, board: Board) {
    await this.likesRepository.save({ user, board });
  }

  /**
   * 좋아요 취소
   */
  async unlike(user: User, board: Board) {
    const findLike: Like = await this.likesRepository.findOne({
      where: { user, board },
    });
    await this.likesRepository.remove(findLike);
  }
}
