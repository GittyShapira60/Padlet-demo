import { BACKGROUND_COLOR_GRADIENTS, POST_COLORS } from '../../../../../shared/constants/background-colors';
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
        {POST_COLORS.map((color) => {
          const isSelected =
            selectedColor.toLowerCase() === color.toLowerCase();

          return (
            <button
              key={color}
              type="button"
              className={`${styles.swatch} ${isSelected ? styles.swatchSelected : ''}`}
              style={{
                background: BACKGROUND_COLOR_GRADIENTS[color] ?? color,
                boxShadow: color === '#FFFFFF' && !isSelected ? 'inset 0 0 0 2px #9ca3af' : undefined,
              }}
              onClick={() => onColorChange(color)}
            />
          );
        })}
      </div>
    </div>
  );
}
