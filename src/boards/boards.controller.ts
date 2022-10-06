import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { User } from 'src/users/entities/users.entity';
import { CurrentUser } from '../common/decorators/user.decorator';
import { BoardDetailInfo, BoardsService } from './boards.service';
import { BoardSearchCondition } from './dto/board-search-condition.dto';
import { CreateBoardDTO } from './dto/create-board.dto';
import { UpdateBoardDTO } from './dto/update-board.dto';
import { Board } from './entities/board.entity';

// Todo: Swagger 응답과 실제 응답과 일치하지 않는 데이터 변경 필요
// Todo: 인터셉터 적용해서 { success: boolean, data: T }포맷으로 응답하도록 변경 필요
// Todo: 전체적으로 불 필요한 service, module, controller 제거

@ApiTags('게시글 API')
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  /**
   * 게시글 생성 API
   */
  @ApiOperation({ summary: '게시글 생성 API' })
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: '게시글 생성 성공',
    schema: { example: { success: true, data: 1 } },
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser() currentUser: User,
    @Body() request: CreateBoardDTO,
  ): Promise<number> {
    return this.boardsService.create(request, currentUser);
  }

  /**
   * 게시글 수정 API
   */
  @ApiOperation({ summary: '게시글 수정 API' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '게시글 수정 성공',
    schema: { example: { success: true, data: null } },
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @CurrentUser() currentUser: User,
    @Param('id', ParseIntPipe) boardId: number,
    @Body() request: UpdateBoardDTO,
  ): Promise<void> {
    await this.boardsService.update(boardId, request, currentUser);
  }

  /**
   * 게시글 삭제 API
   */
  @ApiOperation({ summary: '게시글 삭제 API' })
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: '게시글 삭제 성공',
    schema: { example: { success: true, data: null } },
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @CurrentUser() currentUser: User,
    @Param('id', ParseIntPipe) boardId: number,
  ): Promise<void> {
    await this.boardsService.delete(boardId, currentUser);
  }

  /**
   * 게시글 상세보기 API
   */
  @ApiOperation({ summary: '게시글 상세 조회 API' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '게시글 상세 조회 성공',
    schema: {
      example: {
        success: true,
        data: {
          id: 1,
          title: 'title',
          content: 'content',
          likeCount: 0,
          views: 0,
          hashtags: ['#tag1', '#tag2'],
        },
      },
    },
  })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) boardId: number,
  ): Promise<BoardDetailInfo> {
    return await this.boardsService.getDetail(boardId);
  }

  /**
   * 게시글 목록 API
   */
  @ApiOperation({ summary: '게시글 목록 조회 API' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '게시글 목록 조회 성공',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 1,
            title: 'title',
            content: 'content',
            likeCount: 0,
            views: 0,
            hashtags: ['#tag1', '#tag2'],
          },
        ],
      },
    },
  })
  @Get()
  find(@Body() searchCondition: BoardSearchCondition): Promise<Board[]> {
    return this.boardsService.getList(searchCondition);
  }
}
