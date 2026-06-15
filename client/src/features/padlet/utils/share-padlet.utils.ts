import type { User } from '../../../shared/interfaces/user';
import {
  PadletPermission,
  type PadletPermission as PadletPermissionType,
} from '../enums/padlet-permission';
import type { Collaborator } from '../interfaces/share-padlet.types';

export function buildShareUrl(padletId: string): string {
  return `${window.location.origin}/padlets/${padletId}`;
}

export function getPermissionHint(linkPermission: PadletPermissionType): string {
  return linkPermission === PadletPermission.None
    ? 'כשהקישור הכללי מוגדר ל"אין גישה", רק משתפי פעולה שהוזמנו יוכלו לצפות.'
    : 'רמת ההרשאה של משתף פעולה לא יכולה להיות נמוכה מרמת הקישור הכללי.';
}

export function filterUsersForPicker(
  allUsers: User[],
  searchQuery: string,
  currentUsername: string | undefined,
  collaborators: Collaborator[],
): User[] {
  const query = searchQuery.trim().toLowerCase();

  if (!query) {
    return [];
  }

  const existingIds = new Set(collaborators.map((collaborator) => collaborator.id));

  return allUsers.filter((user) => {
    if (user.username.toLowerCase() === currentUsername?.toLowerCase()) {
      return false;
    }

    if (existingIds.has(user.id)) {
      return false;
    }

    return user.username.toLowerCase().includes(query);
  });
}

export function getInviteCandidates(
  selections: Collaborator[],
  collaborators: Collaborator[],
): Collaborator[] {
  const existingIds = new Set(collaborators.map((collaborator) => collaborator.id));

  return selections.filter((selection) => !existingIds.has(selection.id));
}
