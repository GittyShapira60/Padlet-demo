import type { Padlet, PadletBoards, PadletDetail } from '../interfaces/padlet';
import type { PadletBoardType } from '../enums/padlet-board-type';
import { ApiError, httpClient } from '../../../shared/services';

export interface CreatePadletInput {
  title: string;
  description?: string;
  background: string;
  boardType: PadletBoardType;
}

/**
 * Returns the current user's boards (mine + shared).
 */
export function getPadletBoards(): Promise<PadletBoards> {
  return httpClient<PadletBoards>('padlets');
}

/**
 * Creates a new padlet board for the current user.
 */
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

/**
 * Returns a single padlet with its posts, or null when it does not exist.
 */
export async function getPadletDetail(
  padletId: string,
): Promise<PadletDetail | null> {
  try {
    return await httpClient<PadletDetail>(`padlets/${padletId}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
