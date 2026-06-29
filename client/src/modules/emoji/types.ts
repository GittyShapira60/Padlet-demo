import type { RefObject } from 'react';

export type EmojiCatalogMode = 'reaction' | 'all';

export type EmojiCategoryId =
  | 'recents'
  | 'smileys'
  | 'animals'
  | 'food'
  | 'activities'
  | 'travel'
  | 'objects'
  | 'symbols'
  | 'flags';

export interface EmojiDefinition {
  code: string;
  glyph: string;
  keywords: string[];
  category: Exclude<EmojiCategoryId, 'recents'>;
}

export type EmojiPickerPlacement = 'auto' | 'above' | 'below';
export type EmojiPickerAlign = 'anchor-start' | 'anchor-end';

export interface EmojiPickerPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  catalogMode: EmojiCatalogMode;
  selectedCode?: string | null;
  placement?: EmojiPickerPlacement;
  align?: EmojiPickerAlign;
  onSelect: (emoji: EmojiDefinition) => void;
}
