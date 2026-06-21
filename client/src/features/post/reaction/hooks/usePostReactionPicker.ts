import { useCallback, useMemo, useState } from 'react';
import {
  EMOJI_CATEGORIES,
  ensureEmojiCatalogReady,
  getEmojisByCategory,
  getRecentEmojis,
  isEmojiCatalogReady,
  searchEmojis,
  type EmojiCategoryId,
  type EmojiDefinition,
} from '../emoji/emoji-catalog';
import { loadRecentEmojiCodes } from '../utils/post-reaction-local-store';

export function usePostReactionPicker() {
  const [isOpen, setIsOpen] = useState(false);
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

  const openPicker = useCallback(() => {
    refreshRecents();
    setIsOpen(true);

    if (isEmojiCatalogReady()) {
      setCatalogReady(true);
      return;
    }

    setIsLoading(true);
    void ensureEmojiCatalogReady()
      .then(() => {
        setCatalogReady(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [refreshRecents]);

  const closePicker = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setIsLoading(false);
  }, []);

  const visibleEmojis = useMemo((): EmojiDefinition[] => {
    if (!catalogReady) {
      return [];
    }

    const trimmed = searchQuery.trim();
    if (trimmed) {
      return searchEmojis(trimmed);
    }

    if (activeCategory === 'recents') {
      return getRecentEmojis(recentCodes);
    }

    return getEmojisByCategory(activeCategory);
  }, [activeCategory, catalogReady, recentCodes, searchQuery]);

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
    isOpen,
    isLoading,
    activeCategory,
    searchQuery,
    visibleEmojis,
    activeCategoryLabel,
    setActiveCategory,
    setSearchQuery,
    openPicker,
    closePicker,
    refreshRecents,
  };
}
