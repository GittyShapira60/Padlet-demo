import { useCallback, useEffect, useRef, useState } from 'react';
import type { PostLayout } from '../../../interfaces/post';
import styles from './DraggablePost.module.css';

interface DraggablePostProps {
  layout: PostLayout;
  canDrag: boolean;
  otherLayouts?: PostLayout[];
  onSwapWith: (targetLayout: PostLayout) => void;
  onPreviewSwap: (targetLayout: PostLayout | null) => void;
  className?: string;
  children: React.ReactNode;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function computeOverlapRatio(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  w: number,
  h: number,
): number {
  const iW = Math.max(
    0,
    Math.min(100 - x1, 100 - x2) - Math.max(100 - x1 - w, 100 - x2 - w),
  );
  const iH = Math.max(0, Math.min(y1 + h, y2 + h) - Math.max(y1, y2));
  return (iW * iH) / (w * h);
}

function sameLayout(a: PostLayout | null, b: PostLayout | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y;
}

export default function DraggablePost({
  layout,
  canDrag,
  otherLayouts,
  onSwapWith,
  onPreviewSwap,
  className,
  children,
}: DraggablePostProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [localLayout, setLocalLayout] = useState(layout);
  const [activeDrag, setActiveDrag] = useState(false);
  const latestLayout = useRef(layout);
  const dragStart = useRef({ clientX: 0, clientY: 0, layout });
  const isDragging = useRef(false);
  const dragCardSize = useRef({ wPct: 0, hPct: 0 });
  const activePreviewTarget = useRef<PostLayout | null>(null);

  useEffect(() => {
    setLocalLayout(layout);
    latestLayout.current = layout;
  }, [layout]);

  useEffect(() => {
    latestLayout.current = localLayout;
  }, [localLayout]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!canDrag || event.button !== 0) return;
      if ((event.target as HTMLElement).closest('button, a, [data-no-drag]')) return;

      dragStart.current = { clientX: event.clientX, clientY: event.clientY, layout: latestLayout.current };
      isDragging.current = true;
      setActiveDrag(true);
      event.currentTarget.setPointerCapture(event.pointerId);

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
      if (!isDragging.current) return;

      const parent = wrapperRef.current?.offsetParent as HTMLElement | null;
      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      const deltaX = ((dragStart.current.clientX - event.clientX) / parentRect.width) * 100;
      const deltaY = ((event.clientY - dragStart.current.clientY) / parentRect.height) * 100;

      const newX = clamp(dragStart.current.layout.x + deltaX, 0, 88);
      const newY = clamp(dragStart.current.layout.y + deltaY, 0, 88);
      setLocalLayout({ x: newX, y: newY });

      const others = otherLayouts ?? [];
      const { wPct, hPct } = dragCardSize.current;

      let bestTarget: PostLayout | null = null;
      for (const other of others) {
        if (computeOverlapRatio(newX, newY, other.x, other.y, wPct, hPct) >= 0.5) {
          bestTarget = other;
          break;
        }
      }

      if (!sameLayout(bestTarget, activePreviewTarget.current)) {
        activePreviewTarget.current = bestTarget;
        onPreviewSwap(bestTarget);
      }
    },
    [otherLayouts, onPreviewSwap],
  );

  const finishDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;

      isDragging.current = false;
      setActiveDrag(false);
      event.currentTarget.releasePointerCapture(event.pointerId);

      const target = activePreviewTarget.current;
      activePreviewTarget.current = null;
      onPreviewSwap(null);

      if (target) {
        setLocalLayout(target);
        onSwapWith(target);
      } else {
        setLocalLayout(dragStart.current.layout);
      }
    },
    [onSwapWith, onPreviewSwap],
  );

  const wrapperClassName = [
    styles.wrapper,
    canDrag ? styles.draggable : '',
    activeDrag ? styles.dragging : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={wrapperRef}
      className={wrapperClassName}
      style={{ top: `${localLayout.y}%`, right: `${localLayout.x}%` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
    >
      {children}
    </div>
  );
}
