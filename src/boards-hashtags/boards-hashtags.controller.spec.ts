import { Test, TestingModule } from '@nestjs/testing';
import { BoardsHashtagsController } from './boards-hashtags.controller';
import { BoardsHashtagsService } from './boards-hashtags.service';

describe('BoardsHashtagsController', () => {
  let controller: BoardsHashtagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardsHashtagsController],
      providers: [BoardsHashtagsService],
    }).compile();

    controller = module.get<BoardsHashtagsController>(BoardsHashtagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
