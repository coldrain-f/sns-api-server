import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignupRequestDTO {
  @IsString()
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
