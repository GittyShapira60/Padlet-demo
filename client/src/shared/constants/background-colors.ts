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

/** Wallpaper images for the images tab in the background picker. Served from /public for stable (unhashed) URLs. */
export const BACKGROUND_IMAGES: string[] = [
  '/wallpapers/p1.jpg',
  '/wallpapers/p2.jpg',
  '/wallpapers/p3.jpg',
  '/wallpapers/p4.jpg',
  '/wallpapers/p5.jpg',
  '/wallpapers/p6.jpg',
  '/wallpapers/p7.jpg',
  '/wallpapers/p8.jpeg',
  '/wallpapers/p9.jpg',
  '/wallpapers/p10.jpg',
  '/wallpapers/p11.avif',
  '/wallpapers/p12.jpg',
  '/wallpapers/p13.webp',
  '/wallpapers/p14.jpg',
  '/wallpapers/p15.webp',
];

/** Gradient wallpapers for the patterns tab in the background picker. */
export const BACKGROUND_GRADIENTS = [
  'linear-gradient(135deg, #1e3c72 0%, #2a5298 35%, #38b2ac 70%, #81e6d9 100%)',
  'linear-gradient(135deg, #f953c6 0%, #ff6b35 40%, #f7931e 70%, #ffcc02 100%)',
  'linear-gradient(135deg, #6a0dad 0%, #c0392b 33%, #e67e22 66%, #f1c40f 100%)',
  'linear-gradient(135deg, #1a237e 0%, #0097a7 35%, #4caf50 65%, #cddc39 100%)',
  'linear-gradient(135deg, #134e5e 0%, #2ecc71 40%, #a8e063 75%, #f9d423 100%)',
  'linear-gradient(135deg, #00b4db 0%, #48dbfb 35%, #f78ca0 70%, #f9748f 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 40%, #a18cd1 70%, #fbc2eb 100%)',
  'linear-gradient(135deg, #c0392b 0%, #8e44ad 35%, #2980b9 65%, #1abc9c 100%)',
] as const;

export type BackgroundGradient = (typeof BACKGROUND_GRADIENTS)[number];

export function resolveBackgroundStyle(
  value: string | null | undefined,
  defaultBg = '#f3f4f6',
): Record<string, string> {
  if (!value) return { background: defaultBg };
  if (value.startsWith('/') || value.startsWith('http')) {
    return { backgroundImage: `url(${value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  return { background: BACKGROUND_COLOR_GRADIENTS[value] ?? value };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

function getPerceivedBrightness(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 255;
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
}

/** Determines whether a padlet background reads as "light" (dark text/icons) or "dark" (light text/icons). */
export function isLightBackground(value: string | null | undefined): boolean {
  if (!value) return true;
  if (value.startsWith('/') || value.startsWith('http')) return false;

  const resolved = BACKGROUND_COLOR_GRADIENTS[value] ?? value;
  const hexMatches = resolved.match(/#[0-9a-fA-F]{6}/g);
  if (!hexMatches || hexMatches.length === 0) return true;

  const avgBrightness =
    hexMatches.reduce((sum, hex) => sum + getPerceivedBrightness(hex), 0) / hexMatches.length;
  return avgBrightness > 150;
}
