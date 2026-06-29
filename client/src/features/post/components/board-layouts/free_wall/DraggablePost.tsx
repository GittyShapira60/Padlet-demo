import { useCallback, useEffect, useRef, useState } from 'react';
import type { PostLayout } from '../../../interfaces/post';
import styles from './DraggablePost.module.css';

interface DraggablePostProps {
  layout: PostLayout;
  canDrag: boolean;
  otherLayouts?: PostLayout[];
  onLayoutChange: (layout: PostLayout) => void;
  className?: string;
  children: React.ReactNode;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function hasOverlap(
  x: number,
  y: number,
  wPct: number,
  hPct: number,
  others: PostLayout[],
): boolean {
  const selfLeft = 100 - x - wPct;
  const selfRight = 100 - x;
  const selfTop = y;
  const selfBottom = y + hPct;

  return others.some((other) => {
    const oLeft = 100 - other.x - wPct;
    const oRight = 100 - other.x;
    const oTop = other.y;
    const oBottom = other.y + hPct;
    return selfLeft < oRight && selfRight > oLeft && selfTop < oBottom && selfBottom > oTop;
  });
}

export default function DraggablePost({
  layout,
  canDrag,
  otherLayouts,
  onLayoutChange,
  className,
  children,
}: DraggablePostProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [localLayout, setLocalLayout] = useState(layout);
  const latestLayout = useRef(layout);
  const dragStart = useRef({
    clientX: 0,
    clientY: 0,
    layout: layout,
  });
  const isDragging = useRef(false);
  const dragCardSize = useRef({ wPct: 0, hPct: 0 });

  useEffect(() => {
    setLocalLayout(layout);
    latestLayout.current = layout;
  }, [layout]);

  useEffect(() => {
    latestLayout.current = localLayout;
  }, [localLayout]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!canDrag || event.button !== 0) {
        return;
      }

      if ((event.target as HTMLElement).closest('button, a, [data-no-drag]')) {
        return;
      }

      dragStart.current = {
        clientX: event.clientX,
        clientY: event.clientY,
        layout: latestLayout.current,
      };
      isDragging.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);

      // Capture card size as % of parent at drag start
      const parent = wrapperRef.current?.offsetParent as HTMLElement | null;
      if (parent && wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        dragCardSize.current = {
          wPct: (rect.width / parentRect.width) * 100,
          hPct: (rect.height / parentRect.height) * 100,
        };
      }
    },
    [canDrag],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) {
        return;
      }

      const parent = wrapperRef.current?.offsetParent as HTMLElement | null;

      if (!parent) {
        return;
      }

      const parentRect = parent.getBoundingClientRect();
      const deltaX =
        ((dragStart.current.clientX - event.clientX) / parentRect.width) * 100;
      const deltaY =
        ((event.clientY - dragStart.current.clientY) / parentRect.height) * 100;

      const newX = clamp(dragStart.current.layout.x + deltaX, 0, 88);
      const newY = clamp(dragStart.current.layout.y + deltaY, 0, 88);

      const others = otherLayouts ?? [];
      const { wPct, hPct } = dragCardSize.current;
      const curX = latestLayout.current.x;
      const curY = latestLayout.current.y;

      // Try full move, then slide on one axis only
      if (!hasOverlap(newX, newY, wPct, hPct, others)) {
        setLocalLayout({ x: newX, y: newY });
      } else if (!hasOverlap(newX, curY, wPct, hPct, others)) {
        setLocalLayout({ x: newX, y: curY });
      } else if (!hasOverlap(curX, newY, wPct, hPct, others)) {
        setLocalLayout({ x: curX, y: newY });
      }
      // else: both axes blocked — don't move
    },
    [otherLayouts],
  );

  const finishDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) {
        return;
      }

      isDragging.current = false;
      event.currentTarget.releasePointerCapture(event.pointerId);
      onLayoutChange(latestLayout.current);
    },
    [onLayoutChange],
  );

  const wrapperClassName = [
    styles.wrapper,
    canDrag ? styles.draggable : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={wrapperRef}
      className={wrapperClassName}
      style={{
        top: `${localLayout.y}%`,
        right: `${localLayout.x}%`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
    >
      {children}
    </div>
  );
}
