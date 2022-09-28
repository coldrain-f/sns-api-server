import { IsNotEmpty, IsString } from 'class-validator';

export class SignupRequestDTO {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  rawPassword: string;
}
