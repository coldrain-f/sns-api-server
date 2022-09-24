import { Board } from 'src/boards/entities/board.entity';
import { HashTag } from 'src/hashtags/entities/hashtag.entity';
import {
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BoardHashTag {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Board, (board) => board.boardHashTags)
  board: Board;

  @ManyToOne(() => HashTag, (hashTag) => hashTag.boardHashTags)
  hashTag: HashTag;
}
