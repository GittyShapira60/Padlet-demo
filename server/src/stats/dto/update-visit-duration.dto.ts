import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateVisitDurationDto {
  @ApiProperty({ example: 120 })
  @IsInt()
  @Min(0)
  duration_sec!: number;
}
