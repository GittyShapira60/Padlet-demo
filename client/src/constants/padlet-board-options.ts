import { PadletBoardType } from '../enums/padlet-board-type';

export type BoardPreviewType = 'freewall' | 'grid' | 'brainstorm' | 'timeline';

export interface PadletBoardOption {
  id: PadletBoardType;
  label: string;
  description: string;
  emoji: string;
  preview: BoardPreviewType;
}

export const PADLET_BOARD_OPTIONS: PadletBoardOption[] = [
  {
    id: PadletBoardType.FreeWall,
    label: 'קיר חופשי',
    description: 'גרור פוסטים לכל מקום',
    emoji: '🟧',
    preview: 'freewall',
  },
  {
    id: PadletBoardType.Grid,
    label: 'רשת',
    description: 'פריסה מסודרת בעמודות',
    emoji: '⊞',
    preview: 'grid',
  },
  {
    id: PadletBoardType.Brainstorming,
    label: 'סיעור מוחות',
    description: 'פוסטים כבועות מחשבה',
    emoji: '🧠',
    preview: 'brainstorm',
  },
  {
    id: PadletBoardType.Timeline,
    label: 'ציר זמן',
    description: 'פוסטים לפי סדר כרונולוגי',
    emoji: '📅',
    preview: 'timeline',
  },
];
