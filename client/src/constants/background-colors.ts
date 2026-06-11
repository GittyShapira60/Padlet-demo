/** Solid background swatches for padlets and posts (shared picker). */
export const BACKGROUND_COLORS = [
  '#FFF59D',
  '#C8E6C9',
  '#F8BBD0',
  '#BBDEFB',
  '#E1BEE7',
  '#FFE0B2',
  '#C2F0E7',
  '#FFCDD2',
  '#E8EAF6',
] as const;

export type BackgroundColor = (typeof BACKGROUND_COLORS)[number];
