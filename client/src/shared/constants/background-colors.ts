/** Solid background swatches for padlets and posts (shared picker). */
export const BACKGROUND_COLORS = [
  '#E57373',
  '#FF8A65',
  '#FFD54F',
  '#81C784',
  '#4DB6AC',
  '#64B5F6',
  '#BA68C8',
  '#F06292',
  '#FFB74D',
] as const;

/** Gradient display per color — light → dark of the same hue. */
export const BACKGROUND_COLOR_GRADIENTS: Record<string, string> = {
  '#E57373': 'linear-gradient(135deg, #FFEBEE, #E57373)',
  '#FF8A65': 'linear-gradient(135deg, #FBE9E7, #FF8A65)',
  '#FFD54F': 'linear-gradient(135deg, #FFFDE7, #FFD54F)',
  '#81C784': 'linear-gradient(135deg, #F1F8E9, #81C784)',
  '#4DB6AC': 'linear-gradient(135deg, #E0F2F1, #4DB6AC)',
  '#64B5F6': 'linear-gradient(135deg, #E3F2FD, #64B5F6)',
  '#BA68C8': 'linear-gradient(135deg, #F3E5F5, #BA68C8)',
  '#F06292': 'linear-gradient(135deg, #FCE4EC, #F06292)',
  '#FFB74D': 'linear-gradient(135deg, #FFF3E0, #FFB74D)',
};

/** Lighter version of each color — for post card backgrounds. */
export const BACKGROUND_COLOR_LIGHT: Record<string, string> = {
  '#E57373': '#EF9A9A',
  '#FF8A65': '#FFAB91',
  '#FFD54F': '#FFE082',
  '#81C784': '#A5D6A7',
  '#4DB6AC': '#80CBC4',
  '#64B5F6': '#90CAF9',
  '#BA68C8': '#CE93D8',
  '#F06292': '#F48FB1',
  '#FFB74D': '#FFCC80',
};

export type BackgroundColor = (typeof BACKGROUND_COLORS)[number];
