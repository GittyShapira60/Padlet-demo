import type { EmojiMartData } from '@emoji-mart/data';
import type { EmojiCatalogMode, EmojiCategoryId, EmojiDefinition } from '../types';
import { loadEmojiMartData } from '../services/emoji-mart-loader';

export interface EmojiCategory {
  id: EmojiCategoryId;
  label: string;
  navIcon: string;
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
let martData: EmojiMartData | null = null;

let reactionByCode = new Map<string, EmojiDefinition>();
let reactionByCategory = new Map<
  Exclude<EmojiCategoryId, 'recents'>,
  EmojiDefinition[]
>();
let reactionAll: EmojiDefinition[] = [];

let allByCode = new Map<string, EmojiDefinition>();
let allByCategory = new Map<
  Exclude<EmojiCategoryId, 'recents'>,
  EmojiDefinition[]
>();
let allEmojis: EmojiDefinition[] = [];

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

function emptyCategoryMap(): Map<
  Exclude<EmojiCategoryId, 'recents'>,
  EmojiDefinition[]
> {
  const map = new Map<Exclude<EmojiCategoryId, 'recents'>, EmojiDefinition[]>();

  for (const category of EMOJI_CATEGORIES) {
    if (category.id !== 'recents') {
      map.set(category.id, []);
    }
  }

  return map;
}

function buildCatalog(data: EmojiMartData): void {
  martData = data;

  const nextReactionByCode = new Map<string, EmojiDefinition>();
  const nextReactionByCategory = emptyCategoryMap();
  const nextAllByCode = new Map<string, EmojiDefinition>();
  const nextAllByCategory = emptyCategoryMap();

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

      const keywords = [emoji.name, ...(emoji.keywords ?? [])].map((keyword) =>
        keyword.toLowerCase(),
      );

      if (!nextAllByCode.has(emojiId)) {
        const allDefinition: EmojiDefinition = {
          code: emojiId,
          glyph,
          keywords,
          category: uiCategory,
        };
        nextAllByCode.set(emojiId, allDefinition);
        nextAllByCategory.get(uiCategory)?.push(allDefinition);
      }

      const reactionCode = reactionCodeForEmojiId(emojiId, data.aliases);
      if (!reactionCode || nextReactionByCode.has(reactionCode)) {
        continue;
      }

      const reactionDefinition: EmojiDefinition = {
        code: reactionCode,
        glyph,
        keywords,
        category: uiCategory,
      };
      nextReactionByCode.set(reactionCode, reactionDefinition);
      nextReactionByCategory.get(uiCategory)?.push(reactionDefinition);
    }
  }

  reactionByCode = nextReactionByCode;
  reactionByCategory = nextReactionByCategory;
  reactionAll = Array.from(nextReactionByCode.values());

  allByCode = nextAllByCode;
  allByCategory = nextAllByCategory;
  allEmojis = Array.from(nextAllByCode.values());

  catalogBuilt = true;
}

function mapsForMode(mode: EmojiCatalogMode) {
  return mode === 'reaction'
    ? {
        byCode: reactionByCode,
        byCategory: reactionByCategory,
        all: reactionAll,
      }
    : {
        byCode: allByCode,
        byCategory: allByCategory,
        all: allEmojis,
      };
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

export function resolveEmojiByCode(code: string): EmojiDefinition | undefined {
  const direct = reactionByCode.get(code) ?? allByCode.get(code);
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
  mode: EmojiCatalogMode = 'reaction',
): EmojiDefinition[] {
  return mapsForMode(mode).byCategory.get(category) ?? [];
}

export function searchEmojis(
  query: string,
  mode: EmojiCatalogMode = 'reaction',
): EmojiDefinition[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return mapsForMode(mode).all.filter(
    (emoji) =>
      emoji.code.includes(normalized) ||
      emoji.keywords.some((keyword) => keyword.includes(normalized)) ||
      emoji.glyph.includes(normalized),
  );
}

export function getRecentEmojis(
  codes: string[],
  mode: EmojiCatalogMode = 'reaction',
): EmojiDefinition[] {
  const { byCode } = mapsForMode(mode);

  return codes
    .map((code) => byCode.get(code) ?? resolveEmojiByCode(code))
    .filter((emoji): emoji is EmojiDefinition => Boolean(emoji));
}
