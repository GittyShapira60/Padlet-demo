import { ApiProperty } from '@nestjs/swagger';
import { PadletBoardType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePadletDto {
  @ApiProperty({ example: 'הלוח שלי' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @ApiProperty({ example: 'לוח משימות לצוות', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'linear-gradient(160deg, #6a3de8 0%, #c084fc 100%)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  background?: string;

  @ApiProperty({ enum: PadletBoardType, example: PadletBoardType.free_wall })
  @IsEnum(PadletBoardType)
  board_type!: PadletBoardType;
}

export class CopyPadletDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  includePosts!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  includeParticipants!: boolean;
}