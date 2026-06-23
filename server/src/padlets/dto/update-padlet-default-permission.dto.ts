import { Allow, IsEnum, IsOptional } from 'class-validator';
import { PadletPermission } from '@prisma/client';

export class UpdatePadletDefaultPermissionDto {
  @Allow()
  @IsOptional()
  @IsEnum(PadletPermission)
  default_permission!: PadletPermission | null;
}
