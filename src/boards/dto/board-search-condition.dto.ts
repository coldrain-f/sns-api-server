import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class BoardSearchCondition {
  @Min(1)
  @IsNumber()
  @IsOptional()
  page: number | 1;

  @IsNumber()
  @IsOptional()
  size: number | 10;

  // 정렬컬럼,오름차순|내림차순
  // 사용 방법: column,asc|desc
  sort: string | 'createdAt,desc';

  // enum으로 변경 하기
  @IsString()
  @IsOptional()
  sortDirection: string | 'desc';
}
