import type { CSSProperties } from 'react';
import { BACKGROUND_COLOR_GRADIENTS, BACKGROUND_COLORS, BACKGROUND_GRADIENTS, BACKGROUND_IMAGES } from '../../constants/background-colors';
import styles from './BackgroundPicker.module.css';

export type BackgroundTab = 'colors' | 'images' | 'patterns';

function SwatchGrid({
  items,
  selected,
  getStyle,
  onSelect,
}: {
  items: readonly string[];
  selected: string;
  getStyle: (item: string) => CSSProperties;
  onSelect: (item: string) => void;
}) {
  return (
    <div className={styles.gradientGrid}>
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className={`${styles.gradientSwatch} ${selected === item ? styles.gradientSwatchSelected : ''}`}
          style={getStyle(item)}
          onClick={() => onSelect(item)}
        >
          {selected === item && <span className={styles.gradientCheckmark}>✓</span>}
        </button>
      ))}
    </div>
  );
}

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
      ) : activeTab === 'images' ? (
        <SwatchGrid
          items={BACKGROUND_IMAGES}
          selected={selectedColor}
          getStyle={(src) => ({ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' })}
          onSelect={onColorChange}
        />
      ) : activeTab === 'patterns' ? (
        <SwatchGrid
          items={BACKGROUND_GRADIENTS}
          selected={selectedColor}
          getStyle={(gradient) => ({ background: gradient })}
          onSelect={onColorChange}
        />
      ) : null}
    </div>
  );
}
