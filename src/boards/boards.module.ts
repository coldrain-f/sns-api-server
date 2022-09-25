import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { Hashtag } from 'src/hashtags/entities/hashtag.entity';
import { BoardHashtag } from 'src/boards-hashtags/entities/board-hashtag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Hashtag, BoardHashtag])],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
