import { PADLET_BOARD_OPTIONS } from '../../../constants/padlet-board-options';
import type { PadletBoardType } from '../../../../padlet/enums/padlet-board-type';
import BoardPreview from './BoardPreview';
import styles from './BoardTypePicker.module.css';

interface BoardTypePickerProps {
  value: PadletBoardType;
  onChange: (boardType: PadletBoardType) => void;
}

export default function BoardTypePicker({ value, onChange }: BoardTypePickerProps) {
  return (
    <div className={styles.list}>
      {PADLET_BOARD_OPTIONS.map((option) => {
        const Icon = option.icon;

        return (
        <button
          key={option.id}
          type="button"
          className={`${styles.item} ${value === option.id ? styles.itemActive : ''}`}
          onClick={() => onChange(option.id)}
        >
          <span className={styles.text}>
            <span className={styles.label}>
              <Icon size={18} className={styles.boardIcon} aria-hidden />
              <span>{option.label}</span>
            </span>
            <span className={styles.description}>{option.description}</span>
          </span>
          <span className={styles.preview}>
            <BoardPreview type={option.preview} active={value === option.id} />
          </span>
        </button>
        );
      })}
    </div>
  );
}
