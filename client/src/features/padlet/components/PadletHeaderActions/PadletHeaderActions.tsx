import { useEffect, useRef, useState } from 'react';
import { LogOut, Pencil, Search, Settings, Share2 } from '../../../../shared/icons';
import PostFilterBar from '../../../post/components/PostFilterBar/PostFilterBar';
import styles from './PadletHeaderActions.module.css';

interface PadletHeaderActionsProps {
  showMenu: boolean;
  canEditPadlet: boolean;
  canShare: boolean;
  isShared: boolean;
  onEdit: () => void;
  onShare: () => void;
  onLeave: () => void;
  hasPosts: boolean;
  search: string;
  author: string;
  onSearchChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
}

export default function PadletHeaderActions({
  showMenu,
  canEditPadlet,
  canShare,
  isShared,
  onEdit,
  onShare,
  onLeave,
  hasPosts,
  search,
  author,
  onSearchChange,
  onAuthorChange,
}: PadletHeaderActionsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.wrapper}>
      {hasPosts ? (
        <div ref={searchRef} className={styles.searchWrapper}>
          <button
            type="button"
            className={`${styles.iconBtn} ${isSearchOpen ? styles.iconBtnTransparent : ''}`}
            aria-label="חיפוש וסינון"
            onClick={() => setIsSearchOpen((prev) => !prev)}
          >
            <Search size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
          {isSearchOpen ? (
            <div className={styles.searchPopover}>
              <PostFilterBar
                search={search}
                author={author}
                onSearchChange={onSearchChange}
                onAuthorChange={onAuthorChange}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {showMenu ? (
        <div ref={menuRef} className={styles.menuWrapper}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="אפשרויות"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <Settings size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
          {isMenuOpen ? (
            <div className={styles.dropdown}>
              {canEditPadlet ? (
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit();
                  }}
                >
                  <Pencil size={15} strokeWidth={2} aria-hidden="true" />
                  עריכה
                </button>
              ) : null}
              {canShare ? (
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onShare();
                  }}
                >
                  <Share2 size={15} strokeWidth={2} aria-hidden="true" />
                  שיתוף
                </button>
              ) : null}
              {isShared ? (
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLeave();
                  }}
                >
                  <LogOut size={15} strokeWidth={2} aria-hidden="true" />
                  עזוב לוח
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
