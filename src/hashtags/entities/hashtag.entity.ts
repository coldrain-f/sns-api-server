import { BoardHashtag } from 'src/boards-hashtags/entities/board-hashtag.entity';
import {
  Column,
  CreateDateColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class Hashtag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => BoardHashtag, (boardHashtag) => boardHashtag.hashtag)
  boardHashtags: BoardHashtag;
}
