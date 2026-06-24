import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Pencil, Share2 } from '../../../../shared/icons';
import styles from './PadletBoardHeader.module.css';

interface PadletBoardHeaderProps {
  onShareClick: () => void;
  onEditClick: () => void;
}

export default function PadletBoardHeader({
  onShareClick,
  onEditClick,
}: PadletBoardHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleEdit() {
    setIsOpen(false);
    onEditClick();
  }

  function handleShare() {
    setIsOpen(false);
    onShareClick();
  }

  return (
    <div className={styles.row} ref={ref}>
      <button
        type="button"
        className={styles.menuBtn}
        aria-label="אפשרויות נוספות"
        onClick={() => setIsOpen((prev: boolean) => !prev)}
      >
        <MoreVertical size={18} strokeWidth={2} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className={styles.dropdown}>
          <button type="button" className={styles.dropdownItem} onClick={handleEdit}>
            <Pencil size={15} strokeWidth={2} aria-hidden="true" />
            עריכה
          </button>
          <button type="button" className={styles.dropdownItem} onClick={handleShare}>
            <Share2 size={15} strokeWidth={2} aria-hidden="true" />
            שיתוף
          </button>
        </div>
      ) : null}
    </div>
  );
}
