import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

export type Payload = {
  email: string;
  sub: string;
};

@Injectable()
export class JwtStrtegy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET_KEY'),
    });
  }

  async validate(payload: Payload) {
    // Controller에서 @Req를 주입받으면 여기서 반환한 user를 사용할 수 있다.
    const user = await this.usersService.findUserBySub(payload.sub);
    return user;
  }
}
