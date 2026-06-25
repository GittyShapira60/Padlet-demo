import type { Post } from '../../post/interfaces/post';
import {
  getPermissionRank,
  isPermissionAtLeast,
  PadletPermission,
  type PadletPermission as PadletPermissionType,
} from '../enums/padlet-permission';

export interface PadletCapabilities {
  permission: PadletPermissionType;
  canView: boolean;
  canReact: boolean;
  canComment: boolean;
  canCreatePost: boolean;
  canEditPadlet: boolean;
  canShare: boolean;
  canEditPost: (post: Post) => boolean;
  canDeletePost: (post: Post) => boolean;
  canDragPost: (post: Post) => boolean;
}

function isAuthor(post: Post, currentUsername?: string): boolean {
  if (!currentUsername) {
    return false;
  }

  return post.authorUsername.toLowerCase() === currentUsername.toLowerCase();
}

export function buildPadletCapabilities(
  permission: PadletPermissionType,
  currentUsername?: string,
): PadletCapabilities {
  const canEditOwnPost = (post: Post) =>
    isPermissionAtLeast(permission, PadletPermission.Editor) &&
    isAuthor(post, currentUsername);

  return {
    permission,
    canView: isPermissionAtLeast(permission, PadletPermission.Viewer),
    canReact: isPermissionAtLeast(permission, PadletPermission.Commenter),
    canComment: isPermissionAtLeast(permission, PadletPermission.Commenter),
    canCreatePost: isPermissionAtLeast(permission, PadletPermission.Editor),
    canEditPadlet: isPermissionAtLeast(permission, PadletPermission.Admin),
    canShare: isPermissionAtLeast(permission, PadletPermission.Admin),
    canEditPost: canEditOwnPost,
    canDeletePost: canEditOwnPost,
    canDragPost: canEditOwnPost,
  };
}

export function mapApiPermission(
  permission: string,
): PadletPermissionType {
  const values = Object.values(PadletPermission) as PadletPermissionType[];
  if (values.includes(permission as PadletPermissionType)) {
    return permission as PadletPermissionType;
  }

  return PadletPermission.Viewer;
}

export function mapDefaultPermissionToLink(
  defaultPermission: PadletPermissionType | null | undefined,
): PadletPermissionType {
  return defaultPermission ?? PadletPermission.None;
}

export function mapLinkPermissionToApi(
  linkPermission: PadletPermissionType,
): PadletPermissionType | null {
  return linkPermission === PadletPermission.None ? null : linkPermission;
}

export function getPermissionRankForSort(permission: PadletPermissionType): number {
  return getPermissionRank(permission);
}
