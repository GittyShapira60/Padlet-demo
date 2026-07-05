import { BACKGROUND_COLOR_GRADIENTS, BACKGROUND_COLORS, BACKGROUND_GRADIENTS, BACKGROUND_IMAGES } from '../../constants/background-colors';
import styles from './BackgroundPicker.module.css';

export type BackgroundTab = 'colors' | 'images' | 'patterns';

const TAB_LABELS: Record<BackgroundTab, string> = {
  colors: 'צבעוניים',
  images: 'תמונות',
  patterns: 'טפטים',
};

const TABS: BackgroundTab[] = ['colors', 'images', 'patterns'];

interface BackgroundPickerProps {
  activeTab: BackgroundTab;
  selectedColor: string;
  onTabChange: (tab: BackgroundTab) => void;
  onColorChange: (color: string) => void;
}

export default function BackgroundPicker({
  activeTab,
  selectedColor,
  onTabChange,
  onColorChange,
}: BackgroundPickerProps) {
  return (
    <div className={styles.root}>
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {activeTab === 'colors' ? (
        <div className={styles.colorGrid}>
          {BACKGROUND_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`${styles.swatch} ${selectedColor === color ? styles.swatchSelected : ''}`}
              style={
                (BACKGROUND_COLOR_GRADIENTS[color] ?? color).includes('gradient')
                  ? {
                      backgroundImage: BACKGROUND_COLOR_GRADIENTS[color],
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : { backgroundColor: color }
              }
              onClick={() => onColorChange(color)}
            />
          ))}
        </div>
      ) : activeTab === 'images' ? (
        <div className={styles.gradientGrid}>
          {BACKGROUND_IMAGES.map((src) => (
            <button
              key={src}
              type="button"
              className={`${styles.gradientSwatch} ${selectedColor === src ? styles.gradientSwatchSelected : ''}`}
              style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
              onClick={() => onColorChange(src)}
            />
          ))}
        </div>
      ) : activeTab === 'patterns' ? (
        <div className={styles.gradientGrid}>
          {BACKGROUND_GRADIENTS.map((gradient) => (
            <button
              key={gradient}
              type="button"
              className={`${styles.gradientSwatch} ${selectedColor === gradient ? styles.gradientSwatchSelected : ''}`}
              style={{ backgroundImage: gradient, backgroundRepeat: 'no-repeat' }}
              onClick={() => onColorChange(gradient)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
