import { useCallback, useEffect, useMemo, useState } from 'react';
import type { EmojiCatalogMode, EmojiCategoryId, EmojiDefinition } from '../types';
import {
  EMOJI_CATEGORIES,
  ensureEmojiCatalogReady,
  getEmojisByCategory,
  getRecentEmojis,
  isEmojiCatalogReady,
  searchEmojis,
} from '../utils/emoji-catalog';
import { loadRecentEmojiCodes } from '../services/emoji-recent-store';

export function useEmojiPicker(catalogMode: EmojiCatalogMode) {
  const [isLoading, setIsLoading] = useState(false);
  const [catalogReady, setCatalogReady] = useState(() => isEmojiCatalogReady());
  const [activeCategory, setActiveCategory] = useState<EmojiCategoryId>('smileys');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentCodes, setRecentCodes] = useState<string[]>(() =>
    loadRecentEmojiCodes(),
  );

  const refreshRecents = useCallback(() => {
    setRecentCodes(loadRecentEmojiCodes());
  }, []);

  const reset = useCallback(() => {
    setSearchQuery('');
  }, []);

  useEffect(() => {
    if (catalogReady) {
      return;
    }

    setIsLoading(true);
    void ensureEmojiCatalogReady()
      .then(() => setCatalogReady(true))
      .finally(() => setIsLoading(false));
  }, [catalogReady]);

  const visibleEmojis = useMemo((): EmojiDefinition[] => {
    if (!catalogReady) {
      return [];
    }

    const trimmed = searchQuery.trim();
    if (trimmed) {
      return searchEmojis(trimmed, catalogMode);
    }

    if (activeCategory === 'recents') {
      return getRecentEmojis(recentCodes, catalogMode);
    }

    return getEmojisByCategory(activeCategory, catalogMode);
  }, [activeCategory, catalogMode, catalogReady, recentCodes, searchQuery]);

  const activeCategoryLabel = useMemo(() => {
    if (isLoading) {
      return 'טוען...';
    }

    if (searchQuery.trim()) {
      return 'תוצאות חיפוש';
    }

    return (
      EMOJI_CATEGORIES.find((category) => category.id === activeCategory)
        ?.label ?? ''
    );
  }, [activeCategory, isLoading, searchQuery]);

  return {
    isLoading,
    activeCategory,
    searchQuery,
    visibleEmojis,
    activeCategoryLabel,
    setActiveCategory,
    setSearchQuery,
    refreshRecents,
    reset,
  };
}
