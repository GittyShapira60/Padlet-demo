import { BACKGROUND_COLOR_GRADIENTS, BACKGROUND_COLORS } from '../../../../../shared/constants/background-colors';
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
      <div className={styles.swatches}>
        {BACKGROUND_COLORS.map((color) => {
          const isSelected =
            selectedColor.toLowerCase() === color.toLowerCase();

          return (
            <button
              key={color}
              type="button"
              className={`${styles.swatch} ${isSelected ? styles.swatchSelected : ''}`}
              style={{ background: BACKGROUND_COLOR_GRADIENTS[color] ?? color }}
              onClick={() => onColorChange(color)}
            />
          );
        })}
      </div>
    </div>
  );
}
