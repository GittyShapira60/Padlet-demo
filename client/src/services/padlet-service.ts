import type { Padlet, PadletBoards } from '../interfaces/padlet';
import type { PadletDetail, Post } from '../interfaces/post';
import type { PadletBoardType } from '../enums/padlet-board-type';
import { PadletBoardType as BoardType } from '../enums/padlet-board-type';
import { getStoredPostsForPadlet, seedPostsForPadlet } from './post-service';
import { httpClient } from './http-client';

const createdPadlets = new Map<string, Padlet>();

export interface CreatePadletInput {
  title: string;
  description?: string;
  background: string;
  boardType: PadletBoardType;
}

const MOCK_PADLETS: PadletBoards = {
  mine: [
    {
      id: '1',
      title: 'הלוח שלי',
      description: 'הלוח שלי',
      boardType: BoardType.FreeWall,
      background: 'linear-gradient(160deg, #6a3de8 0%, #9b59f5 45%, #c084fc 100%)',
      postCount: 0,
      isShared: false,
      updatedAt: '2026-06-07T10:00:00.000Z',
    },
  ],
  shared: [
    {
      id: '2',
      title: 'לוח משימות',
      description: 'המשימות של הצוות',
      boardType: BoardType.Grid,
      background:
        'repeating-linear-gradient(45deg, #1a4a8a 0, #1a4a8a 2px, #1e5a9e 2px, #1e5a9e 8px)',
      postCount: 3,
      isShared: true,
      updatedAt: '2026-06-06T14:30:00.000Z',
    },
  ],
};

const EMPTY_PADLETS: PadletBoards = {
  mine: [],
  shared: [],
};

const MOCK_POSTS: Record<string, Post[]> = {
  '2': [
    {
      id: 'p1',
      padletId: '2',
      authorUsername: 'דנה',
      title: 'סיכום ישיבה',
      subject: 'להעביר את המסמך לצוות עד יום חמישי',
      color: '#fff9c4',
      layout: { x: 8, y: 14 },
      createdAt: '2026-06-05T09:00:00.000Z',
    },
    {
      id: 'p2',
      padletId: '2',
      authorUsername: 'יוסי',
      title: 'רעיון למוצר',
      subject: 'לוח משימות משותף עם תזכורות',
      color: '#f8bbd0',
      layout: { x: 38, y: 22 },
      createdAt: '2026-06-05T11:30:00.000Z',
    },
    {
      id: 'p3',
      padletId: '2',
      authorUsername: 'מיה',
      title: 'משימות השבוע',
      subject: 'עיצוב, פיתוח, בדיקות',
      color: '#c8e6c9',
      layout: { x: 62, y: 48 },
      createdAt: '2026-06-06T08:15:00.000Z',
    },
  ],
};

function findPadletById(id: string): Padlet | null {
  const fromMock = [...MOCK_PADLETS.mine, ...MOCK_PADLETS.shared].find(
    (padlet) => padlet.id === id,
  );

  return fromMock ?? createdPadlets.get(id) ?? null;
}

function getMockPosts(padletId: string): Post[] {
  return MOCK_POSTS[padletId] ?? [];
}

/**
 * Returns the current user's boards (mine + shared).
 * Falls back to mock data until GET /padlets exists on the server.
 */
export async function getPadletBoards(): Promise<PadletBoards> {
  try {
    return await httpClient<PadletBoards>('padlets');
  } catch {
    return MOCK_PADLETS;
  }
}

export async function getEmptyPadletBoards(): Promise<PadletBoards> {
  return EMPTY_PADLETS;
}

function buildMockPadlet(input: CreatePadletInput): Padlet {
  return {
    id: String(Date.now()),
    title: input.title,
    description: input.description ?? null,
    boardType: input.boardType,
    background: input.background,
    postCount: 0,
    isShared: false,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Creates a new padlet board for the current user.
 * Falls back to a local mock until POST /padlets exists on the server.
 */
export async function createPadlet(input: CreatePadletInput): Promise<Padlet> {
  try {
    const padlet = await httpClient<Padlet>('padlets', {
      method: 'POST',
      body: {
        title: input.title,
        description: input.description,
        background: input.background,
        board_type: input.boardType,
      },
    });
    createdPadlets.set(padlet.id, padlet);
    return padlet;
  } catch {
    const padlet = buildMockPadlet(input);
    createdPadlets.set(padlet.id, padlet);
    return padlet;
  }
}

/**
 * Returns a single padlet with its posts.
 * Falls back to local mock data until GET /padlets/:id exists on the server.
 */
export async function getPadletDetail(padletId: string): Promise<PadletDetail | null> {
  try {
    return await httpClient<PadletDetail>(`padlets/${padletId}`);
  } catch {
    const padlet = findPadletById(padletId);
    if (!padlet) {
      return null;
    }

    seedPostsForPadlet(padletId, getMockPosts(padletId));

    return {
      padlet,
      posts: getStoredPostsForPadlet(padletId),
    };
  }
}
