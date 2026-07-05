import { useCallback, useLayoutEffect, useRef, useState } from 'react';

const H_PADDING = 16;
const V_PADDING = 14;
const GAP_X = 24;
const GAP_Y = 22;
const TARGET_COLUMNS = 5;
const MIN_COLUMN_WIDTH = 220;
const MAX_COLUMN_WIDTH = 260;
const BOTTOM_PADDING = 80;

export interface MasonryPosition {
  top: number;
  right: number;
  width: number;
}

interface MasonryLayout {
  positions: MasonryPosition[];
  height: number;
}

export function useMasonryLayout(itemCount: number, layoutKey = '') {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [layout, setLayout] = useState<MasonryLayout | null>(null);

  const setItemRef = useCallback((index: number, el: HTMLDivElement | null) => {
    itemRefs.current[index] = el;
  }, []);

  useLayoutEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, itemCount);
  }, [itemCount]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || itemCount === 0) {
      setLayout(null);
      return;
    }

    const compute = () => {
      const containerWidth = container.clientWidth;
      const available = containerWidth - H_PADDING * 2;
      let columnCount = TARGET_COLUMNS;
      let columnWidth = (available - GAP_X * (columnCount - 1)) / columnCount;

      if (columnWidth < MIN_COLUMN_WIDTH) {
        columnCount = Math.max(
          1,
          Math.floor((available + GAP_X) / (MIN_COLUMN_WIDTH + GAP_X)),
        );
        columnWidth = (available - GAP_X * (columnCount - 1)) / columnCount;
      } else {
        columnWidth = Math.min(columnWidth, MAX_COLUMN_WIDTH);
      }

      container.style.setProperty('--masonry-slot-width', `${columnWidth}px`);

      const columnHeights = new Array<number>(columnCount).fill(V_PADDING);
      const positions: MasonryPosition[] = [];

      for (let index = 0; index < itemCount; index++) {
        const el = itemRefs.current[index];
        const height = el?.offsetHeight ?? 0;

        let col = 0;
        for (let c = 1; c < columnCount; c++) {
          if (columnHeights[c] < columnHeights[col]) {
            col = c;
          }
        }

        positions[index] = {
          top: columnHeights[col],
          right: H_PADDING + col * (columnWidth + GAP_X),
          width: columnWidth,
        };

        columnHeights[col] += height + GAP_Y;
      }

      setLayout({
        positions,
        height: Math.max(...columnHeights, V_PADDING) + BOTTOM_PADDING,
      });
    };

    compute();
    const settlePass = requestAnimationFrame(compute);

    const observer = new ResizeObserver(compute);
    observer.observe(container);
    itemRefs.current.forEach((el) => {
      if (el) {
        observer.observe(el);
      }
    });

    return () => {
      cancelAnimationFrame(settlePass);
      observer.disconnect();
    };
  }, [itemCount, layoutKey]);

  return { containerRef, setItemRef, layout };
}
