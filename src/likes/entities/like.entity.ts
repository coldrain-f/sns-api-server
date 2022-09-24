import { Board } from 'src/boards/entities/board.entity';
import { User } from 'src/users/entities/users.entity';
import {
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.likes)
  user: User;

  @ManyToOne(() => Board, (board) => board.likes)
  board: Board;
}
