import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginRequestDTO } from 'src/users/dto/login-request.dto';
import { User } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Payload } from './jwt/jwt.strategy';
import { ApiProperty } from '@nestjs/swagger';

export class JwtTokenInfo {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9sYWZAbmF2ZXIuY29tIiwic3ViIjoiNiIsImlhdCI6MTY2NTA0NDk5NiwiZXhwIjoxNjk2NjAyNTk2fQ.le6etwLENg61rfCnJhCyLgejgo9AxGwSjS-by0il2gs',
  })
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async jwtLogin(request: LoginRequestDTO): Promise<JwtTokenInfo> {
    const { email, rawPassword } = request;

    // 이메일이 존재하는지 체크
    const findUser = await this.usersRepository.findOne({ where: { email } });

    if (!findUser) {
      throw new UnauthorizedException('이메일을 확인해 주세요');
    }

    // 비밀번호가 일치하는지 체크
    const isExistPassword: boolean = await bcrypt.compare(
      rawPassword,
      findUser.password,
    );
    if (!isExistPassword) {
      throw new UnauthorizedException('비밀번호를 확인해 주세요.');
    }

    const payload: Payload = { email, sub: findUser.id.toString() };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
