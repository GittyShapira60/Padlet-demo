import type { PadletPermission } from '../enums/padlet-permission';
import type { Collaborator } from '../interfaces/share-padlet.types';
import { httpClient } from '../../../shared/services';

export function getParticipants(padletId: string): Promise<Collaborator[]> {
  return httpClient<Collaborator[]>(`padlets/${padletId}/participants`);
}

export function inviteParticipant(
  padletId: string,
  userId: string,
  permission: PadletPermission,
): Promise<Collaborator> {
  return httpClient<Collaborator>(`padlets/${padletId}/participants`, {
    method: 'POST',
    body: {
      user_id: userId,
      permission,
    },
  });
}

export function removeParticipant(padletId: string, userId: string): Promise<void> {
  return httpClient<void>(`padlets/${padletId}/participants/${userId}`, {
    method: 'DELETE',
  });
}

export function updateParticipantPermission(
  padletId: string,
  userId: string,
  permission: PadletPermission,
): Promise<Collaborator> {
  return httpClient<Collaborator>(
    `padlets/${padletId}/participants/${userId}`,
    {
      method: 'PATCH',
      body: { permission },
    },
  );
}
