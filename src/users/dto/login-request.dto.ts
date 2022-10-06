import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDTO {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'olaf@naver.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'olaf',
  })
  rawPassword: string;
}
