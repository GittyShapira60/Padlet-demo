import type { CSSProperties } from 'react';
import type { MasonryPosition } from './useMasonryLayout';

export function masonryItemStyle(position: MasonryPosition): CSSProperties {
  return {
    top: position.top,
    right: position.right,
    width: position.width,
    visibility: 'visible',
  };
}

export const hiddenMasonryItemStyle: CSSProperties = {
  top: 0,
  right: 0,
  visibility: 'hidden',
};
