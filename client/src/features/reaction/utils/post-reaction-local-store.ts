const RECENT_EMOJIS_KEY = 'padlet_recent_emojis';
const MAX_RECENT_EMOJIS = 16;

export function loadRecentEmojiCodes(): string[] {
  const raw = localStorage.getItem(RECENT_EMOJIS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((code): code is string => typeof code === 'string');
  } catch {
    localStorage.removeItem(RECENT_EMOJIS_KEY);
    return [];
  }
}

export function saveRecentEmojiCode(reactionCode: string): void {
  const current = loadRecentEmojiCodes().filter((code) => code !== reactionCode);
  const next = [reactionCode, ...current].slice(0, MAX_RECENT_EMOJIS);
  localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(next));
}
