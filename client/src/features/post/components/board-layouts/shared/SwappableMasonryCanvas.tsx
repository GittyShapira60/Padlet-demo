import { useCallback, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { hiddenMasonryItemStyle, masonryItemStyle } from './masonryStyles';
import { useMasonryLayout } from './useMasonryLayout';

interface SwappableMasonryCanvasProps<T extends { id: string }> {
  items: T[];
  canvasClassName: string;
  itemClassName: string;
  draggingItemClassName?: string;
  canDragItem?: (item: T) => boolean;
  onSwap?: (sourceId: string, targetId: string) => void;
  renderItem: (item: T, index: number) => ReactNode;
}

interface DragState {
  sourceIndex: number;
  deltaX: number;
  deltaY: number;
}

const DRAG_INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, label, [contenteditable="true"], [data-no-drag]';

function findHoveredIndex(
  rects: DOMRect[],
  clientX: number,
  clientY: number,
  excludeIndex: number,
): number | null {
  for (let index = 0; index < rects.length; index++) {
    if (index === excludeIndex) continue;

    const rect = rects[index];
    if (!rect) continue;

    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      return index;
    }
  }

  return null;
}

export default function SwappableMasonryCanvas<T extends { id: string }>({
  items,
  canvasClassName,
  itemClassName,
  draggingItemClassName,
  canDragItem,
  onSwap,
  renderItem,
}: SwappableMasonryCanvasProps<T>) {
  const layoutKey = useMemo(() => items.map((item) => item.id).join('\0'), [items]);
  const { containerRef, setItemRef, layout } = useMasonryLayout(items.length, layoutKey);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragRects = useRef<DOMRect[]>([]);
  const dragListeners = useRef<{ move: (event: PointerEvent) => void; up: (event: PointerEvent) => void } | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const setCombinedItemRef = useCallback(
    (index: number, element: HTMLDivElement | null) => {
      itemRefs.current[index] = element;
      setItemRef(index, element);
    },
    [setItemRef],
  );

  const removeDragListeners = useCallback(() => {
    const listeners = dragListeners.current;
    if (!listeners) return;

    window.removeEventListener('pointermove', listeners.move);
    window.removeEventListener('pointerup', listeners.up);
    window.removeEventListener('pointercancel', listeners.up);
    dragListeners.current = null;
  }, []);

  const finishDrag = useCallback(
    (clientX: number, clientY: number, sourceIndex: number) => {
      removeDragListeners();

      const hoverIndex = findHoveredIndex(dragRects.current, clientX, clientY, sourceIndex);
      setDragState(null);

      if (hoverIndex === null || hoverIndex === sourceIndex) {
        return;
      }

      const sourceItem = items[sourceIndex];
      const targetItem = items[hoverIndex];
      if (!sourceItem || !targetItem) {
        return;
      }

      onSwap?.(sourceItem.id, targetItem.id);
    },
    [items, onSwap, removeDragListeners],
  );

  const handlePointerDown = useCallback(
    (index: number, event: React.PointerEvent<HTMLDivElement>) => {
      const item = items[index];
      if (!item || !canDragItem?.(item) || event.button !== 0) {
        return;
      }

      if ((event.target as HTMLElement).closest(DRAG_INTERACTIVE_SELECTOR)) {
        return;
      }

      removeDragListeners();

      const pointerId = event.pointerId;
      const startX = event.clientX;
      const startY = event.clientY;

      dragRects.current = itemRefs.current.map((element) => element?.getBoundingClientRect() ?? new DOMRect());

      setDragState({
        sourceIndex: index,
        deltaX: 0,
        deltaY: 0,
      });

      event.currentTarget.setPointerCapture(pointerId);

      const moveHandler = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) return;

        setDragState({
          sourceIndex: index,
          deltaX: moveEvent.clientX - startX,
          deltaY: moveEvent.clientY - startY,
        });
      };

      const upHandler = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== pointerId) return;
        try {
          event.currentTarget.releasePointerCapture(pointerId);
        } catch {
          // capture may already be released
        }
        finishDrag(upEvent.clientX, upEvent.clientY, index);
      };

      dragListeners.current = { move: moveHandler, up: upHandler };
      window.addEventListener('pointermove', moveHandler);
      window.addEventListener('pointerup', upHandler);
      window.addEventListener('pointercancel', upHandler);
      event.preventDefault();
    },
    [canDragItem, finishDrag, items, removeDragListeners],
  );

  return (
    <div
      ref={containerRef}
      className={canvasClassName}
      style={layout ? { height: layout.height } : undefined}
    >
      {items.map((item, index) => {
        const position = layout?.positions[index];
        const isDragging = dragState?.sourceIndex === index;

        const className = [
          itemClassName,
          canDragItem?.(item) ? 'is-draggable' : '',
          isDragging ? draggingItemClassName : '',
        ]
          .filter(Boolean)
          .join(' ');

        let style: CSSProperties;

        if (!position) {
          style = hiddenMasonryItemStyle;
        } else if (isDragging) {
          style = {
            ...masonryItemStyle(position),
            transform: `translate(${dragState.deltaX}px, ${dragState.deltaY}px)`,
          };
        } else {
          style = masonryItemStyle(position);
        }

        return (
          <div
            key={item.id}
            ref={(element) => setCombinedItemRef(index, element)}
            className={className}
            style={style}
            onPointerDown={(event) => handlePointerDown(index, event)}
          >
            {renderItem(item, index)}
          </div>
        );
      })}
    </div>
  );
}
