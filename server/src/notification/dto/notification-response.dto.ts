export interface NotificationResponseDto {
  id: string;
  type: string;
  actorUsername: string;
  padletId: string | null;
  postId: string | null;
  isRead: boolean;
  createdAt: string;
}
