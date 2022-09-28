import { Body, Controller, Post } from '@nestjs/common';
import { AuthService, JwtTokenInfo } from 'src/auth/auth.service';
import { LoginRequestDTO } from './dto/login-request.dto';
import { SignupRequestDTO } from './dto/signup-request.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  signup(@Body() request: SignupRequestDTO): Promise<number> {
    return this.usersService.signup(request);
  }

  @Post('login')
  login(@Body() request: LoginRequestDTO): Promise<JwtTokenInfo> {
    return this.authService.jwtLogin(request);
  }
}
