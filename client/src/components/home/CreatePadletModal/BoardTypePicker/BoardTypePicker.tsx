import { PADLET_BOARD_OPTIONS } from '../../../../constants/padlet-board-options';
import type { PadletBoardType } from '../../../../enums/padlet-board-type';
import BoardPreview from './BoardPreview';
import styles from './BoardTypePicker.module.css';

interface BoardTypePickerProps {
  value: PadletBoardType;
  onChange: (boardType: PadletBoardType) => void;
}

export default function BoardTypePicker({ value, onChange }: BoardTypePickerProps) {
  return (
    <div className={styles.list} role="radiogroup" aria-label="סוג לוח">
      {PADLET_BOARD_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          className={`${styles.item} ${value === option.id ? styles.itemActive : ''}`}
          onClick={() => onChange(option.id)}
        >
          <span className={styles.text}>
            <span className={styles.label}>
              {option.emoji} {option.label}
            </span>
            <span className={styles.description}>{option.description}</span>
          </span>
          <span className={styles.preview}>
            <BoardPreview type={option.preview} active={value === option.id} />
          </span>
        </button>
      ))}
    </div>
  );
}
