import type { EmojiMartData } from '@emoji-mart/data';

let cachedData: EmojiMartData | null = null;
let loadPromise: Promise<EmojiMartData> | null = null;

export function isEmojiMartDataLoaded(): boolean {
  return cachedData !== null;
}

export function getEmojiMartData(): EmojiMartData | null {
  return cachedData;
}

export function loadEmojiMartData(): Promise<EmojiMartData> {
  if (cachedData) {
    return Promise.resolve(cachedData);
  }

  if (!loadPromise) {
    loadPromise = import('@emoji-mart/data').then((module) => {
      const data = (module.default ?? module) as EmojiMartData;
      cachedData = data;
      return data;
    });
  }

  return loadPromise;
}
