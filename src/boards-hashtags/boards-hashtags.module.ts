import { Module } from '@nestjs/common';
import { BoardsHashtagsService } from './boards-hashtags.service';
import { BoardsHashtagsController } from './boards-hashtags.controller';

@Module({
  controllers: [BoardsHashtagsController],
  providers: [BoardsHashtagsService]
})
export class BoardsHashtagsModule {}
