import type { Padlet, PadletBoards, PadletDetail } from '../interfaces/padlet';
import type { PadletBoardType } from '../enums/padlet-board-type';
import { ApiError, httpClient } from '../../../shared/services';

export interface CreatePadletInput {
  title: string;
  description?: string;
  background: string;
  boardType: PadletBoardType;
}

export function deletePadlet(padletId: string): Promise<void> {
  return httpClient<void>('padlets/' + padletId, { method: 'DELETE' });
}

export function leavePadlet(padletId: string): Promise<void> {
  return httpClient<void>('padlets/' + padletId + '/participants/me', {
    method: 'DELETE',
  });
}

export function getPadletBoards(): Promise<PadletBoards> {
  return httpClient<PadletBoards>('padlets');
}

export function createPadlet(input: CreatePadletInput): Promise<Padlet> {
  return httpClient<Padlet>('padlets', {
    method: 'POST',
    body: {
      title: input.title,
      description: input.description,
      background: input.background,
      board_type: input.boardType,
    },
  });
}

export async function getPadletDetail(padletId: string): Promise<PadletDetail | null> {
  try {
    return await httpClient<PadletDetail>('padlets/' + padletId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export interface CopyPadletOptions {
  includePosts: boolean;
  includeParticipants: boolean;
}

export function copyPadlet(padletId: string, options: CopyPadletOptions): Promise<Padlet> {
  return httpClient<Padlet>('padlets/' + padletId + '/copy', {
    method: 'POST',
    body: options,
  });
}
