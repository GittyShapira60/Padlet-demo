import { PadletPermission } from '@prisma/client';

const RANK: Record<PadletPermission, number> = {
  [PadletPermission.viewer]: 1,
  [PadletPermission.commenter]: 2,
  [PadletPermission.editor]: 3,
  [PadletPermission.admin]: 4,
  [PadletPermission.owner]: 5,
};

export function isPermissionAtLeast(
  permission: PadletPermission,
  minimum: PadletPermission,
): boolean {
  return RANK[permission] >= RANK[minimum];
}

export function canView(permission: PadletPermission): boolean {
  return isPermissionAtLeast(permission, PadletPermission.viewer);
}

export function canReact(permission: PadletPermission): boolean {
  return isPermissionAtLeast(permission, PadletPermission.commenter);
}

export function canComment(permission: PadletPermission): boolean {
  return isPermissionAtLeast(permission, PadletPermission.commenter);
}

export function canCreatePost(permission: PadletPermission): boolean {
  return isPermissionAtLeast(permission, PadletPermission.editor);
}

export function canEditPost(
  permission: PadletPermission,
  isAuthor: boolean,
): boolean {
  return isAuthor && isPermissionAtLeast(permission, PadletPermission.editor);
}

export function canDeletePost(
  permission: PadletPermission,
  isAuthor: boolean,
): boolean {
  return isAuthor && isPermissionAtLeast(permission, PadletPermission.editor);
}

export function canManageSharing(permission: PadletPermission): boolean {
  return isPermissionAtLeast(permission, PadletPermission.admin);
}

export function canEditPadlet(permission: PadletPermission): boolean {
  return isPermissionAtLeast(permission, PadletPermission.admin);
}

export function canDeletePadlet(permission: PadletPermission): boolean {
  return permission === PadletPermission.owner;
}
