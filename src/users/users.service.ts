import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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

    // 이메일 중복체크
    const findUser = await this.usersRepository.findOne({ where: { email } });
    if (findUser) {
      throw new BadRequestException('이미 가입된 이메일입니다.');
    }

    const savedUser = await this.usersRepository.save({
      email,
      password: hashedPassword,
    });
    return savedUser.id;
  }

  /**
   * JWT sub로 사용자 조회
   */
  async findUserBySub(jwtSub: string): Promise<User> {
    const findUser = await this.usersRepository.findOne({
      select: { id: true, email: true, createdAt: true, updatedAt: true },
      where: { id: parseInt(jwtSub) },
    });
    if (!findUser) {
      throw new UnauthorizedException();
    }
    return findUser;
  }
}
