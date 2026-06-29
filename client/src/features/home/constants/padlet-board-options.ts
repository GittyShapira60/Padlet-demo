import type { ComponentType } from 'react';
import { Brain, Calendar, LayoutGrid, Square } from '@/shared/icons';
import { PadletBoardType } from '../../padlet/enums/padlet-board-type';
import { PADLET_BOARD_OPTION_TEXTS } from './padlet-board-options.consts';

export type BoardPreviewType = 'freewall' | 'grid' | 'brainstorm' | 'timeline';

type BoardOptionIcon = ComponentType<{ size?: number | string; className?: string }>;

export interface PadletBoardOption {
  id: PadletBoardType;
  label: string;
  description: string;
  icon: BoardOptionIcon;
  preview: BoardPreviewType;
}

const BOARD_OPTION_CONFIG: {
  id: PadletBoardType;
  icon: BoardOptionIcon;
  preview: BoardPreviewType;
}[] = [
  { id: PadletBoardType.FreeWall, icon: Square, preview: 'freewall' },
  { id: PadletBoardType.Grid, icon: LayoutGrid, preview: 'grid' },
  { id: PadletBoardType.Brainstorming, icon: Brain, preview: 'brainstorm' },
  { id: PadletBoardType.Timeline, icon: Calendar, preview: 'timeline' },
];

export const PADLET_BOARD_OPTIONS: PadletBoardOption[] = BOARD_OPTION_CONFIG.map(
  ({ id, icon, preview }) => ({
    id,
    icon,
    preview,
    ...PADLET_BOARD_OPTION_TEXTS[id],
  }),
);
