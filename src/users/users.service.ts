import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignupRequestDTO } from './dto/signup-request.dto';
import { User } from './entities/users.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * 회원가입
   */
  async signup(request: SignupRequestDTO): Promise<number> {
    const { email, rawPassword } = request;

    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const savedUser = await this.usersRepository.save({
      email,
      password: hashedPassword,
    });
    return savedUser.id;
  }
}
