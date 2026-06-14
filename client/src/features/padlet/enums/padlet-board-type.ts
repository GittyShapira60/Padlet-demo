export const PadletBoardType = {
  FreeWall: 'free_wall',
  Brainstorming: 'brainstorming',
  Grid: 'grid',
  Timeline: 'timeline',
} as const;

export type PadletBoardType =
  (typeof PadletBoardType)[keyof typeof PadletBoardType];

export const PADLET_BOARD_TYPE_LABELS: Record<PadletBoardType, string> = {
  [PadletBoardType.FreeWall]: 'קיר חופשי',
  [PadletBoardType.Brainstorming]: 'סיעור מוחות',
  [PadletBoardType.Grid]: 'רשת',
  [PadletBoardType.Timeline]: 'ציר זמן',
};
