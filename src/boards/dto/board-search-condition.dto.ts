import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class BoardSearchCondition {
  @Min(1)
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 1,
  })
  page: number | 1;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 10,
  })
  size: number | 10;

  // 정렬컬럼,오름차순|내림차순
  // 사용 방법: column,asc|desc
  @ApiProperty({
    example: 'createdAt,desc',
  })
  sort: string | 'createdAt,desc';

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'keyword',
  })
  search: string | '';
}
