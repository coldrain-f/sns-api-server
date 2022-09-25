import { Body, Controller, Get, Post } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDTO } from './dto/create-board.dto';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}
  // https://bow-hair-db3.notion.site/d90aadcf516e4762b406a6e3e36604dc

  // Todo: 인터셉터로 응답 결과 커스텀 적용
  // { success: true | false, data: [] | {} }

  /**
   * 게시글 생성 API
   */
  @Post()
  create(@Body() dto: CreateBoardDTO) {
    // Todo: JWT 토큰에서 사용자 PK를 추출해서 넘겨주도록 해야한다.
    const { title, content, hashtags } = dto;
    this.boardsService.create(title, content, hashtags);
  }
  /**
   * 게시글 수정 API
   */
  /**
   * 게시글 삭제 API
   */
  /**
   * 게시글 상세보기 API
   */
  /**
   * 게시글 목록 API
   */
}
