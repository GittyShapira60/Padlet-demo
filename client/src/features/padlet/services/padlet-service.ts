import type { Padlet, PadletBoards, PadletDetail } from '../interfaces/padlet';
import type { PadletBoardType } from '../enums/padlet-board-type';
import { ApiError, httpClient } from '../../../shared/services';

export interface CreatePadletInput {
  title: string;
  description?: string;
  background: string;
  boardType: PadletBoardType;
}

export interface UpdatePadletInput {
  title: string;
  description?: string;
  background: string;
  boardType: PadletBoardType;
}

export function deletePadlet(padletId: string): Promise<void> {
  return httpClient<void>('padlets/' + padletId, { method: 'DELETE' });
}

export function updatePadlet(
  padletId: string,
  input: UpdatePadletInput,
): Promise<Padlet> {
  return httpClient<Padlet>('padlets/' + padletId, {
    method: 'PATCH',
    body: {
      title: input.title,
      description: input.description,
      background: input.background,
      board_type: input.boardType,
    },
  });
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

export interface PadletDetailFilter {
  search?: string;
  author?: string;
}

export async function getPadletDetail(
  padletId: string,
  filter?: PadletDetailFilter,
): Promise<PadletDetail | null> {
  try {
    const params = new URLSearchParams();
    if (filter?.search) params.set('search', filter.search);
    if (filter?.author) params.set('author', filter.author);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await httpClient<PadletDetail>('padlets/' + padletId + query);
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