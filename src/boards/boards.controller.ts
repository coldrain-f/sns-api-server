import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { User } from 'src/users/entities/users.entity';
import { CurrentUser } from '../common/decorators/user.decorator';
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
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser() currentUser: User,
    @Body() request: CreateBoardDTO,
  ) {
    await this.boardsService.create(request, currentUser);
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
    await this.boardsService.getDetail(boardId);
  }
  /**
   * 게시글 목록 API
   */
}
