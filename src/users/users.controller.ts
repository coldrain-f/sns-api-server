import { Body, Controller, Logger, Post } from '@nestjs/common';
import { SignupRequestDTO } from './dto/signup-request.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  signup(@Body() request: SignupRequestDTO): Promise<number> {
    return this.usersService.signup(request);
  }
}
