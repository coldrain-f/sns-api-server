import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  hashtags: string;
}
