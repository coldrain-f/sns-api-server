import { Test, TestingModule } from '@nestjs/testing';
import { BoardsHashtagsService } from './boards-hashtags.service';

describe('BoardsHashtagsService', () => {
  let service: BoardsHashtagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardsHashtagsService],
    }).compile();

    service = module.get<BoardsHashtagsService>(BoardsHashtagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
