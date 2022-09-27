import { forwardRef, Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { Hashtag } from 'src/hashtags/entities/hashtag.entity';
import { BoardHashtag } from 'src/boards-hashtags/entities/board-hashtag.entity';
import { LikesModule } from 'src/likes/likes.module';

@Module({
  imports: [
    LikesModule,
    TypeOrmModule.forFeature([Board, Hashtag, BoardHashtag]),
  ],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
