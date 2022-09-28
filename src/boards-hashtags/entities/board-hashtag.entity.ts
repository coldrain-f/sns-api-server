import { Board } from 'src/boards/entities/board.entity';
import { Hashtag } from 'src/hashtags/entities/hashtag.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class BoardHashtag {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Board, (board) => board.boardHashtags)
  board: Board;

  @ManyToOne(() => Hashtag, (hashtag) => hashtag.boardHashtags)
  hashtag: Hashtag;
}
