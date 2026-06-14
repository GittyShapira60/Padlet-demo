import { BACKGROUND_COLORS } from '../../constants/background-colors';
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
      <div className={styles.tabs} role="tablist" aria-label="סוג רקע">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {activeTab === 'colors' ? (
        <div className={styles.colorGrid} role="listbox" aria-label="בחירת צבע רקע">
          {BACKGROUND_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              role="option"
              aria-selected={selectedColor === color}
              className={`${styles.swatch} ${selectedColor === color ? styles.swatchSelected : ''}`}
              style={{ background: color }}
              onClick={() => onColorChange(color)}
              aria-label={color}
            />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>בקרוב...</p>
      )}
    </div>
  );
}
