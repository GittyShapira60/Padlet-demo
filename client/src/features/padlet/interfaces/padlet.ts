import type { Post } from '../../post/interfaces/post';
import type { PadletBoardType } from '../enums/padlet-board-type';
import type { PadletPermission } from '../enums/padlet-permission';

export interface Padlet {
  id: string;
  title: string;
  description: string | null;
  boardType: PadletBoardType;
  background: string | null;
  postCount: number;
  isShared: boolean;
  updatedAt: string;
  ownerUsername: string;
  createdAt: string;
}

export interface PadletBoards {
  mine: Padlet[];
  shared: Padlet[];
}

export interface PadletDetail {
  padlet: Padlet;
  posts: Post[];
  currentUserPermission: PadletPermission;
  defaultPermission: PadletPermission | null;
}
