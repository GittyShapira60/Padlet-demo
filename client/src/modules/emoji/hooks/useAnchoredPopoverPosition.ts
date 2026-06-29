import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';
import type { EmojiPickerAlign, EmojiPickerPlacement } from '../types';

const VIEWPORT_PADDING = 8;
const ANCHOR_GAP = 8;

interface Position {
  top: number;
  right: number;
  ready: boolean;
}

interface AnchoredPopoverPositionOptions {
  placement?: EmojiPickerPlacement;
  align?: EmojiPickerAlign;
}

function computePosition(
  anchorRect: DOMRect,
  width: number,
  height: number,
  options: AnchoredPopoverPositionOptions = {},
): Pick<Position, 'top' | 'right'> {
  const { placement = 'auto', align = 'anchor-end' } = options;
  const spaceAbove = anchorRect.top - VIEWPORT_PADDING;
  const spaceBelow = window.innerHeight - anchorRect.bottom - VIEWPORT_PADDING;
  const openAbove =
    placement === 'above'
      ? spaceAbove >= height + ANCHOR_GAP || spaceAbove >= spaceBelow
      : placement === 'below'
        ? false
        : spaceAbove >= height + ANCHOR_GAP || spaceAbove >= spaceBelow;

  let top = openAbove
    ? anchorRect.top - ANCHOR_GAP - height
    : anchorRect.bottom + ANCHOR_GAP;

  top = Math.max(
    VIEWPORT_PADDING,
    Math.min(top, window.innerHeight - VIEWPORT_PADDING - height),
  );

  let right =
    align === 'anchor-start'
      ? window.innerWidth - anchorRect.left - width
      : window.innerWidth - anchorRect.right;
  const maxRight = window.innerWidth - width - VIEWPORT_PADDING;
  right = Math.max(VIEWPORT_PADDING, Math.min(right, maxRight));

  return { top, right };
}

export function useAnchoredPopoverPosition(
  anchorRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  remeasureDeps: unknown[] = [],
  options: AnchoredPopoverPositionOptions = {},
): Position {
  const [position, setPosition] = useState<Position>({
    top: 0,
    right: 0,
    ready: false,
  });

  useLayoutEffect(() => {
    if (!isOpen || !anchorRef.current || !popoverRef.current) {
      return;
    }

    function update() {
      const anchor = anchorRef.current;
      const popover = popoverRef.current;
      if (!anchor || !popover) {
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const { top, right } = computePosition(
        rect,
        popover.offsetWidth,
        popover.offsetHeight,
        options,
      );
      setPosition({ top, right, ready: true });
    }

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [anchorRef, isOpen, options.align, options.placement, popoverRef, ...remeasureDeps]);

  useEffect(() => {
    if (!isOpen) {
      setPosition({ top: 0, right: 0, ready: false });
    }
  }, [isOpen]);

  return position;
}
