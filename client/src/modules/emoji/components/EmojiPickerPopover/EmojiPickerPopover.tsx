import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search } from '@/shared/icons';
import type { EmojiDefinition, EmojiPickerPopoverProps } from '../../types';
import { useEmojiPicker } from '../../hooks/useEmojiPicker';
import { useAnchoredPopoverPosition } from '../../hooks/useAnchoredPopoverPosition';
import { saveRecentEmojiCode } from '../../services/emoji-recent-store';
import { EMOJI_CATEGORIES } from '../../utils/emoji-catalog';
import styles from './EmojiPickerPopover.module.css';

export default function EmojiPickerPopover({
  isOpen,
  onClose,
  anchorRef,
  catalogMode,
  selectedCode = null,
  onSelect,
}: EmojiPickerPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const picker = useEmojiPicker(catalogMode);

  const {
    isLoading,
    activeCategory,
    searchQuery,
    visibleEmojis,
    activeCategoryLabel,
    setActiveCategory,
    setSearchQuery,
    refreshRecents,
    reset,
  } = picker;

  const position = useAnchoredPopoverPosition(
    anchorRef,
    popoverRef,
    isOpen,
    [activeCategory, searchQuery, visibleEmojis.length, activeCategoryLabel, isLoading],
  );

  useEffect(() => {
    if (isOpen) {
      refreshRecents();
    } else {
      reset();
    }
  }, [isOpen, refreshRecents, reset]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target)) {
        return;
      }

      if (anchorRef.current?.contains(target)) {
        return;
      }

      onClose();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [anchorRef, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  function handleEmojiSelect(emoji: EmojiDefinition) {
    saveRecentEmojiCode(emoji.code);
    refreshRecents();
    onSelect(emoji);
  }

  return createPortal(
    <div
      ref={popoverRef}
      className={styles.popover}
      style={{
        position: 'fixed',
        top: position.top,
        right: position.right,
        visibility: position.ready ? 'visible' : 'hidden',
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <div className={styles.searchRow}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="search"
          className={styles.searchInput}
          placeholder="חפש אימוג'ים"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <div className={styles.body}>
        <p className={styles.sectionTitle}>{activeCategoryLabel}</p>
        {isLoading ? (
          <p className={styles.loading}>טוען אימוג'ים...</p>
        ) : visibleEmojis.length > 0 ? (
          <div className={styles.grid}>
            {visibleEmojis.map((emoji) => {
              const isSelected = selectedCode === emoji.code;

              return (
                <button
                  key={emoji.code}
                  type="button"
                  className={`${styles.emojiBtn} ${isSelected ? styles.emojiBtnSelected : ''}`}
                  onClick={() => handleEmojiSelect(emoji)}
                >
                  {emoji.glyph}
                </button>
              );
            })}
          </div>
        ) : (
          <p className={styles.empty}>לא נמצאו אימוג'ים</p>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.scrollHint}>&gt;&gt;</span>
        {EMOJI_CATEGORIES.map((category) => {
          const isActive = !searchQuery.trim() && activeCategory === category.id;

          return (
            <button
              key={category.id}
              type="button"
              className={`${styles.categoryBtn} ${isActive ? styles.categoryBtnActive : ''}`}
              onClick={() => {
                setSearchQuery('');
                setActiveCategory(category.id);
              }}
            >
              {category.navIcon}
            </button>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}
