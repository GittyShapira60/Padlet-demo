import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search } from '../../../../shared/icons';
import {
  EMOJI_CATEGORIES,
  type EmojiCategoryId,
  type EmojiDefinition,
} from '../emoji/emoji-catalog';
import styles from './EmojiPickerPopover.module.css';

const VIEWPORT_PADDING = 8;
const ANCHOR_GAP = 8;

interface EmojiPickerPopoverProps {
  isOpen: boolean;
  isLoading: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  activeCategory: EmojiCategoryId;
  searchQuery: string;
  visibleEmojis: EmojiDefinition[];
  activeCategoryLabel: string;
  selectedReactionCode: string | null;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: EmojiCategoryId) => void;
  onSelect: (reactionCode: string) => void;
  onClose: () => void;
}

interface PopoverPosition {
  top: number;
  right: number;
  ready: boolean;
}

function computePopoverPosition(
  anchorRect: DOMRect,
  popoverWidth: number,
  popoverHeight: number,
): Pick<PopoverPosition, 'top' | 'right'> {
  const spaceAbove = anchorRect.top - VIEWPORT_PADDING;
  const spaceBelow = window.innerHeight - anchorRect.bottom - VIEWPORT_PADDING;
  const openAbove =
    spaceAbove >= popoverHeight + ANCHOR_GAP ||
    spaceAbove >= spaceBelow;

  let top = openAbove
    ? anchorRect.top - ANCHOR_GAP - popoverHeight
    : anchorRect.bottom + ANCHOR_GAP;

  top = Math.max(
    VIEWPORT_PADDING,
    Math.min(top, window.innerHeight - VIEWPORT_PADDING - popoverHeight),
  );

  let right = window.innerWidth - anchorRect.right;
  const maxRight = window.innerWidth - popoverWidth - VIEWPORT_PADDING;
  right = Math.max(VIEWPORT_PADDING, Math.min(right, maxRight));

  return { top, right };
}

export default function EmojiPickerPopover({
  isOpen,
  isLoading,
  anchorRef,
  activeCategory,
  searchQuery,
  visibleEmojis,
  activeCategoryLabel,
  selectedReactionCode,
  onSearchChange,
  onCategoryChange,
  onSelect,
  onClose,
}: EmojiPickerPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<PopoverPosition>({
    top: 0,
    right: 0,
    ready: false,
  });

  useLayoutEffect(() => {
    if (!isOpen || !anchorRef.current || !popoverRef.current) {
      return;
    }

    function updatePosition() {
      const anchor = anchorRef.current;
      const popover = popoverRef.current;
      if (!anchor || !popover) {
        return;
      }

      const anchorRect = anchor.getBoundingClientRect();
      const { top, right } = computePopoverPosition(
        anchorRect,
        popover.offsetWidth,
        popover.offsetHeight,
      );

      setPosition({ top, right, ready: true });
    }

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [
    anchorRef,
    isOpen,
    activeCategory,
    searchQuery,
    visibleEmojis.length,
    activeCategoryLabel,
    isLoading,
  ]);

  useEffect(() => {
    if (!isOpen) {
      setPosition({ top: 0, right: 0, ready: false });
    }
  }, [isOpen]);

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
      role="dialog"
      aria-label="בחירת אימוג'י"
      onClick={(event) => event.stopPropagation()}
    >
      <div className={styles.searchRow}>
        <Search size={16} className={styles.searchIcon} aria-hidden />
        <input
          type="search"
          className={styles.searchInput}
          placeholder="חפש אימוג'ים"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className={styles.body}>
        <p className={styles.sectionTitle}>{activeCategoryLabel}</p>
        {isLoading ? (
          <p className={styles.loading}>טוען אימוג'ים...</p>
        ) : visibleEmojis.length > 0 ? (
          <div className={styles.grid}>
            {visibleEmojis.map((emoji) => {
              const isSelected = selectedReactionCode === emoji.code;

              return (
                <button
                  key={emoji.code}
                  type="button"
                  className={`${styles.emojiBtn} ${isSelected ? styles.emojiBtnSelected : ''}`}
                  aria-label={emoji.glyph}
                  onClick={() => onSelect(emoji.code)}
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
        <span className={styles.scrollHint} aria-hidden>
          &gt;&gt;
        </span>
        {EMOJI_CATEGORIES.map((category) => {
          const isActive =
            !searchQuery.trim() && activeCategory === category.id;

          return (
            <button
              key={category.id}
              type="button"
              className={`${styles.categoryBtn} ${isActive ? styles.categoryBtnActive : ''}`}
              aria-label={category.label}
              aria-pressed={isActive}
              onClick={() => {
                onSearchChange('');
                onCategoryChange(category.id);
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
