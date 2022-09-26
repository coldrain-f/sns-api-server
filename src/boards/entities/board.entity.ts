import { BoardHashtag } from 'src/boards-hashtags/entities/board-hashtag.entity';
import { Like } from 'src/likes/entities/like.entity';
import { User } from 'src/users/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  likeCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @ManyToOne(() => User, (user) => user.boards)
  user: User;

  @OneToMany(() => Like, (like) => like.board)
  likes: Like[];

  @OneToMany(() => BoardHashtag, (boardHashtag) => boardHashtag.board)
  boardHashtags: BoardHashtag[];
}
