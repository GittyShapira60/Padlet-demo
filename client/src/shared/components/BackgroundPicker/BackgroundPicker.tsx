import { BACKGROUND_COLOR_GRADIENTS, BACKGROUND_COLORS } from '../../constants/background-colors';
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
              style={{ background: BACKGROUND_COLOR_GRADIENTS[color] ?? color }}
              onClick={() => onColorChange(color)}
            />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>בקרוב...</p>
      )}
    </div>
  );
}
