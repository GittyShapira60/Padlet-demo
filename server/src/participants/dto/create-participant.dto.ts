import { PadletPermission } from '@prisma/client';

export class CreateParticipantDto {
  user_id!: string;
  permission!: PadletPermission;
}
