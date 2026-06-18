import { PadletPermission } from '@prisma/client';

export class UpdateParticipantPermissionDto {
  permission!: PadletPermission;
}
