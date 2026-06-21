import type { EmojiMartData } from '@emoji-mart/data';
import { loadEmojiMartData } from './emoji-mart-loader';

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

export interface EmojiCategory {
  id: EmojiCategoryId;
  label: string;
  navIcon: string;
}

export interface EmojiDefinition {
  code: string;
  glyph: string;
  keywords: string[];
  category: Exclude<EmojiCategoryId, 'recents'>;
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  { id: 'recents', label: 'אחרונים', navIcon: '🕒' },
  { id: 'smileys', label: 'סמיילים ואנשים', navIcon: '😀' },
  { id: 'animals', label: 'חיות וטבע', navIcon: '🐻' },
  { id: 'food', label: 'אוכל ושתייה', navIcon: '🍕' },
  { id: 'activities', label: 'פעילויות', navIcon: '⚽' },
  { id: 'travel', label: 'נסיעות ומקומות', navIcon: '🚗' },
  { id: 'objects', label: 'חפצים', navIcon: '💡' },
  { id: 'symbols', label: 'סמלים', navIcon: '💜' },
  { id: 'flags', label: 'דגלים', navIcon: '🏳️' },
];

const MART_CATEGORY_TO_UI: Record<string, Exclude<EmojiCategoryId, 'recents'>> = {
  people: 'smileys',
  nature: 'animals',
  foods: 'food',
  activity: 'activities',
  places: 'travel',
  objects: 'objects',
  symbols: 'symbols',
  flags: 'flags',
};

const LEGACY_REACTION_CODE_ALIASES: Record<string, string> = {
  rofl: 'rolling_on_the_floor_laughing',
  kissing_closed: 'kissing_closed_eyes',
  thinking: 'thinking_face',
};

const VALID_REACTION_CODE = /^[a-z0-9_]+$/;
const MAX_REACTION_CODE_LENGTH = 32;

let catalogBuilt = false;
let buildPromise: Promise<void> | null = null;
let emojiByCode = new Map<string, EmojiDefinition>();
let emojisByCategory = new Map<
  Exclude<EmojiCategoryId, 'recents'>,
  EmojiDefinition[]
>();
let allEmojis: EmojiDefinition[] = [];
let martData: EmojiMartData | null = null;

function isValidReactionCode(code: string): boolean {
  return (
    code.length > 0 &&
    code.length <= MAX_REACTION_CODE_LENGTH &&
    VALID_REACTION_CODE.test(code)
  );
}

function reactionCodeForEmojiId(
  emojiId: string,
  aliases: Record<string, string>,
): string | null {
  if (isValidReactionCode(emojiId)) {
    return emojiId;
  }

  const validAlias = Object.entries(aliases).find(
    ([alias, target]) => target === emojiId && isValidReactionCode(alias),
  );

  return validAlias?.[0] ?? null;
}

function resolveEmojiId(code: string): string | null {
  if (!martData) {
    return null;
  }

  if (martData.emojis[code]) {
    return code;
  }

  const legacyTarget = LEGACY_REACTION_CODE_ALIASES[code];
  if (legacyTarget && martData.emojis[legacyTarget]) {
    return legacyTarget;
  }

  const aliasTarget = martData.aliases[code];
  if (aliasTarget && martData.emojis[aliasTarget]) {
    return aliasTarget;
  }

  return null;
}

function buildCatalog(data: EmojiMartData): void {
  martData = data;

  const nextByCode = new Map<string, EmojiDefinition>();
  const nextByCategory = new Map<
    Exclude<EmojiCategoryId, 'recents'>,
    EmojiDefinition[]
  >();

  for (const category of EMOJI_CATEGORIES) {
    if (category.id === 'recents') {
      continue;
    }

    nextByCategory.set(category.id, []);
  }

  for (const category of data.categories) {
    const uiCategory = MART_CATEGORY_TO_UI[category.id];
    if (!uiCategory) {
      continue;
    }

    for (const emojiId of category.emojis) {
      const emoji = data.emojis[emojiId];
      const glyph = emoji?.skins?.[0]?.native;
      if (!glyph) {
        continue;
      }

      const code = reactionCodeForEmojiId(emojiId, data.aliases);
      if (!code || nextByCode.has(code)) {
        continue;
      }

      const definition: EmojiDefinition = {
        code,
        glyph,
        keywords: [emoji.name, ...(emoji.keywords ?? [])].map((keyword) =>
          keyword.toLowerCase(),
        ),
        category: uiCategory,
      };

      nextByCode.set(code, definition);
      nextByCategory.get(uiCategory)?.push(definition);
    }
  }

  emojiByCode = nextByCode;
  emojisByCategory = nextByCategory;
  allEmojis = Array.from(nextByCode.values());
  catalogBuilt = true;
}

export function isEmojiCatalogReady(): boolean {
  return catalogBuilt;
}

export function ensureEmojiCatalogReady(): Promise<void> {
  if (catalogBuilt) {
    return Promise.resolve();
  }

  if (!buildPromise) {
    buildPromise = loadEmojiMartData().then((data) => {
      buildCatalog(data);
    });
  }

  return buildPromise;
}

export function getEmojiByCode(code: string): EmojiDefinition | undefined {
  const direct = emojiByCode.get(code);
  if (direct) {
    return direct;
  }

  if (!martData) {
    return undefined;
  }

  const emojiId = resolveEmojiId(code);
  if (!emojiId) {
    return undefined;
  }

  const emoji = martData.emojis[emojiId];
  const glyph = emoji?.skins?.[0]?.native;
  if (!glyph) {
    return undefined;
  }

  return {
    code,
    glyph,
    keywords: [emoji.name, ...(emoji.keywords ?? [])].map((keyword) =>
      keyword.toLowerCase(),
    ),
    category: 'objects',
  };
}

export function getEmojisByCategory(
  category: Exclude<EmojiCategoryId, 'recents'>,
): EmojiDefinition[] {
  return emojisByCategory.get(category) ?? [];
}

export function searchEmojis(query: string): EmojiDefinition[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return allEmojis.filter(
    (emoji) =>
      emoji.code.includes(normalized) ||
      emoji.keywords.some((keyword) => keyword.includes(normalized)) ||
      emoji.glyph.includes(normalized),
  );
}

export function getRecentEmojis(codes: string[]): EmojiDefinition[] {
  return codes
    .map((code) => getEmojiByCode(code))
    .filter((emoji): emoji is EmojiDefinition => Boolean(emoji));
}
