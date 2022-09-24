import { BoardHashTag } from 'src/boards-hashtags/entities/board-hashtag.entity';
import {
  Column,
  CreateDateColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class HashTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => BoardHashTag, (boardHashTag) => boardHashTag.hashTag)
  boardHashTags: BoardHashTag;
}
