export const PadletPermission = {
  Owner: 'owner',
  Admin: 'admin',
  Editor: 'editor',
  Commenter: 'commenter',
  Viewer: 'viewer',
} as const;

export type PadletPermission =
  (typeof PadletPermission)[keyof typeof PadletPermission];

export const PADLET_PERMISSION_LABELS: Record<PadletPermission, string> = {
  [PadletPermission.Owner]: 'בעלים',
  [PadletPermission.Admin]: 'מנהל',
  [PadletPermission.Editor]: 'כותב',
  [PadletPermission.Commenter]: 'מגיב',
  [PadletPermission.Viewer]: 'צופה',
};

/** Permissions that can be assigned via link or invite (not owner). */
export const ASSIGNABLE_PADLET_PERMISSIONS: PadletPermission[] = [
  PadletPermission.Viewer,
  PadletPermission.Commenter,
  PadletPermission.Editor,
  PadletPermission.Admin,
];

const PERMISSION_RANK: Record<PadletPermission, number> = {
  [PadletPermission.Viewer]: 1,
  [PadletPermission.Commenter]: 2,
  [PadletPermission.Editor]: 3,
  [PadletPermission.Admin]: 4,
  [PadletPermission.Owner]: 5,
};

export function getPermissionRank(permission: PadletPermission): number {
  return PERMISSION_RANK[permission];
}

export function isPermissionAtLeast(
  permission: PadletPermission,
  minimum: PadletPermission,
): boolean {
  return getPermissionRank(permission) >= getPermissionRank(minimum);
}

export function getPermissionsAtOrAbove(
  minimum: PadletPermission,
): PadletPermission[] {
  const minRank = getPermissionRank(minimum);

  return ASSIGNABLE_PADLET_PERMISSIONS.filter(
    (permission) => getPermissionRank(permission) >= minRank,
  );
}

export function clampPermission(
  permission: PadletPermission,
  minimum: PadletPermission,
): PadletPermission {
  return isPermissionAtLeast(permission, minimum) ? permission : minimum;
}
