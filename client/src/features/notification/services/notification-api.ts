import { httpClient } from '../../../shared/services';
import type { Notification } from '../types/notification';

export async function fetchNotifications(): Promise<Notification[]> {
  return httpClient<Notification[]>('/notifications');
}

export async function markNotificationRead(id: string): Promise<void> {
  await httpClient<void>(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead(): Promise<void> {
  await httpClient<void>('/notifications/read-all', { method: 'PATCH' });
}

export async function deleteNotification(id: string): Promise<void> {
  await httpClient<void>(`/notifications/${id}`, { method: 'DELETE' });
}
