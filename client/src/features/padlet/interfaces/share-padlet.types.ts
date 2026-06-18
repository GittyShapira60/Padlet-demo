import type { PadletPermission } from '../enums/padlet-permission';

export interface Collaborator {
  id: string;
  username: string;
  permission: PadletPermission;
}
