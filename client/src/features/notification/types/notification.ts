export type NotificationType = 'reaction' | 'comment' | 'new_post' | 'padlet_share';

export interface Notification {
  id: string;
  type: NotificationType;
  actorUsername: string;
  padletId: string | null;
  postId: string | null;
  isRead: boolean;
  createdAt: string;
}
