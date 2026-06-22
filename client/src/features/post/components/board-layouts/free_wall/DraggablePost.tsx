import { useCallback, useEffect, useRef, useState } from 'react';
import type { PostLayout } from '../../../interfaces/post';
import styles from './DraggablePost.module.css';

interface DraggablePostProps {
  layout: PostLayout;
  canDrag: boolean;
  onLayoutChange: (layout: PostLayout) => void;
  className?: string;
  children: React.ReactNode;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export default function DraggablePost({
  layout,
  canDrag,
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

      if ((event.target as HTMLElement).closest('button, [data-no-drag]')) {
        return;
      }

      dragStart.current = {
        clientX: event.clientX,
        clientY: event.clientY,
        layout: latestLayout.current,
      };
      isDragging.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
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

      setLocalLayout({
        x: clamp(dragStart.current.layout.x + deltaX, 0, 88),
        y: clamp(dragStart.current.layout.y + deltaY, 0, 88),
      });
    },
    [],
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