import { Controller } from '@nestjs/common';
import { BoardsHashtagsService } from './boards-hashtags.service';

@Controller('boards-hashtags')
export class BoardsHashtagsController {
  constructor(private readonly boardsHashtagsService: BoardsHashtagsService) {}
}
