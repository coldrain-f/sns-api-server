import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService, JwtTokenInfo } from 'src/auth/auth.service';
import { LoginRequestDTO } from './dto/login-request.dto';
import { SignupRequestDTO } from './dto/signup-request.dto';
import { UsersService } from './users.service';

@ApiTags('사용자 API')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: '회원가입 API' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '회원가입 성공',
    schema: { example: { success: true, data: 1 } },
  })
  @Post('signup')
  signup(@Body() request: SignupRequestDTO): Promise<number> {
    return this.usersService.signup(request);
  }

  @ApiOperation({ summary: '로그인 API' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '로그인 성공',
    schema: {
      example: {
        success: true,
        data: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9sYWZAbmF2ZXIuY29tIiwic3ViIjoiNiIsImlhdCI6MTY2NTA0NDk5NiwiZXhwIjoxNjk2NjAyNTk2fQ.le6etwLENg61rfCnJhCyLgejgo9AxGwSjS-by0il2gs',
      },
    },
  })
  @Post('login')
  login(@Body() request: LoginRequestDTO): Promise<JwtTokenInfo> {
    return this.authService.jwtLogin(request);
  }
}
