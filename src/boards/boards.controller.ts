import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDTO } from './dto/create-board.dto';
import { UpdateBoardDTO } from './dto/update-board.dto';

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
  async create(@Body() dto: CreateBoardDTO) {
    // Todo: JWT 토큰에서 사용자 PK를 추출해서 넘겨주도록 해야한다.
    const { title, content, hashtags } = dto;
    await this.boardsService.create(title, content, hashtags);
  }
  /**
   * 게시글 수정 API
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) boardId: number,
    @Body() request: UpdateBoardDTO,
  ) {
    await this.boardsService.update(boardId, request);
  }
  /**
   * 게시글 삭제 API
   */
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) boardId: number) {
    await this.boardsService.delete(boardId);
  }
  /**
   * 게시글 상세보기 API
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) boardId: number) {
    await this.boardsService.findOne(boardId);
  }
  /**
   * 게시글 목록 API
   */
}
