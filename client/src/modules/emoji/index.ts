export { default as EmojiPickerPopover } from './components/EmojiPickerPopover/EmojiPickerPopover';
export type {
  EmojiPickerPopoverProps,
  EmojiDefinition,
  EmojiCatalogMode,
} from './types';
export {
  ensureEmojiCatalogReady,
  isEmojiCatalogReady,
  resolveEmojiByCode,
} from './utils/emoji-catalog';
export { saveRecentEmojiCode } from './services/emoji-recent-store';
