import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GetPadletDetailQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  author?: string;
}
