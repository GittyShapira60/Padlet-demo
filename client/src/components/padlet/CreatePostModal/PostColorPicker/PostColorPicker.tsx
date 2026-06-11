import { BACKGROUND_COLORS } from '../../../../constants/background-colors';
import styles from './PostColorPicker.module.css';

interface PostColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export default function PostColorPicker({
  selectedColor,
  onColorChange,
}: PostColorPickerProps) {
  return (
    <div className={styles.root}>
      <span className={styles.label}>צבע רקע:</span>
      <div className={styles.swatches} role="listbox" aria-label="צבע רקע">
        {BACKGROUND_COLORS.map((color, index) => {
          const isSelected =
            selectedColor.toLowerCase() === color.toLowerCase();

          return (
          <button
            key={color}
            type="button"
            role="option"
            aria-selected={isSelected}
            className={`${styles.swatch} ${isSelected ? styles.swatchSelected : ''}`}
            style={{ background: color }}
            onClick={() => onColorChange(color)}
            aria-label={`צבע רקע ${index + 1}`}
          />
          );
        })}
      </div>
    </div>
  );
}
