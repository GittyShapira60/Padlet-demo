import type { CSSProperties, ReactNode } from 'react';
import { hiddenMasonryItemStyle, masonryItemStyle } from './masonryStyles';
import { useMasonryLayout, type MasonryPosition } from './useMasonryLayout';

interface MasonryCanvasProps<T extends { id: string }> {
  items: T[];
  canvasClassName: string;
  itemClassName: string;
  getItemStyle?: (index: number, position: MasonryPosition) => CSSProperties;
  renderItem: (item: T, index: number) => ReactNode;
}

export default function MasonryCanvas<T extends { id: string }>({
  items,
  canvasClassName,
  itemClassName,
  getItemStyle,
  renderItem,
}: MasonryCanvasProps<T>) {
  const { containerRef, setItemRef, layout } = useMasonryLayout(items.length);

  return (
    <div
      ref={containerRef}
      className={canvasClassName}
      style={layout ? { height: layout.height } : undefined}
    >
      {items.map((item, index) => {
        const position = layout?.positions[index];

        return (
          <div
            key={item.id}
            ref={(element) => setItemRef(index, element)}
            className={itemClassName}
            style={
              position
                ? {
                    ...masonryItemStyle(position),
                    ...(getItemStyle ? getItemStyle(index, position) : {}),
                  }
                : {
                    ...hiddenMasonryItemStyle,
                    ...(getItemStyle
                      ? getItemStyle(index, { top: 0, right: 0, width: 0 })
                      : {}),
                  }
            }
          >
            {renderItem(item, index)}
          </div>
        );
      })}
    </div>
  );
}
