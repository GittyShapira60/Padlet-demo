import { PadletBoardType } from '../../padlet/enums/padlet-board-type';

export const PADLET_BOARD_OPTION_TEXTS: Record<
  PadletBoardType,
  { label: string; description: string }
> = {
  [PadletBoardType.FreeWall]: {
    label: 'קיר חופשי',
    description: 'גרור פוסטים לכל מקום',
  },
  [PadletBoardType.Grid]: {
    label: 'רשת',
    description: 'פריסה מסודרת בעמודות',
  },
  [PadletBoardType.Brainstorming]: {
    label: 'סיעור מוחות',
    description: 'פוסטים כבועות מחשבה',
  },
  [PadletBoardType.Timeline]: {
    label: 'ציר זמן',
    description: 'פוסטים לפי סדר כרונולוגי',
  },
};
