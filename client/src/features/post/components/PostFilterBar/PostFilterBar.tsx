import { SlidersHorizontal, X } from 'lucide-react';
import styles from './PostFilterBar.module.css';

interface PostFilterBarProps {
  search: string;
  author: string;
  onSearchChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
}

export default function PostFilterBar({
  search,
  author,
  onSearchChange,
  onAuthorChange,
}: PostFilterBarProps) {
  const hasFilter = search.trim() !== '' || author.trim() !== '';

  function handleClear() {
    onSearchChange('');
    onAuthorChange('');
  }

  return (
    <div className={styles.bar}>
      <SlidersHorizontal size={16} strokeWidth={2} className={styles.icon} aria-hidden="true" />
      <input
        className={styles.input}
        type="text"
        placeholder="חיפוש לפי תוכן..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="סינון לפי תוכן פוסט"
        dir="rtl"
      />
      <input
        className={styles.input}
        type="text"
        placeholder="סינון לפי מחבר..."
        value={author}
        onChange={(e) => onAuthorChange(e.target.value)}
        aria-label="סינון לפי שם מחבר"
        dir="rtl"
      />
      {hasFilter ? (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={handleClear}
          aria-label="נקה סינון"
        >
          <X size={14} strokeWidth={2.5} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
