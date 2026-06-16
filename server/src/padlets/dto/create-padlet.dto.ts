import { PadletBoardType } from '@prisma/client';

export class CreatePadletDto {
  title!: string;

  description?: string;

  background?: string;

  board_type!: PadletBoardType;
}
