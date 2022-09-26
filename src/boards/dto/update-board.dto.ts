import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBoardDTO {
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
