const BOARD_SCROLL_CONTAINER_SELECTOR = '[data-board-scroll-container]';
const DEFAULT_BOTTOM_INSET_PX = 88;

function getCssVariableSource(): Element {
  return document.querySelector('main')?.parentElement ?? document.documentElement;
}

function getBottomInsetPx(): number {
  const raw = getComputedStyle(getCssVariableSource())
    .getPropertyValue('--board-bottom-dock')
    .trim();

  if (!raw) {
    return DEFAULT_BOTTOM_INSET_PX;
  }

  const probe = document.createElement('div');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.height = raw;
  document.body.appendChild(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();

  return height || DEFAULT_BOTTOM_INSET_PX;
}

function isScrollableOverflow(value: string): boolean {
  return value === 'auto' || value === 'scroll' || value === 'overlay';
}

function getBoardScrollContainer(): HTMLElement | null {
  return document.querySelector<HTMLElement>(BOARD_SCROLL_CONTAINER_SELECTOR);
}

export function hasActiveScrollActivity(container: HTMLElement): boolean {
  const active = document.activeElement;
  if (!active || !container.contains(active)) {
    return false;
  }

  return (
    active.matches('input:not([type="hidden"]), textarea, [contenteditable="true"]') ||
    active.closest('[data-scroll-activity]') !== null
  );
}

export function resetBoardScrollPosition(): void {
  const verticalContainer = getBoardScrollContainer();
  verticalContainer?.scrollTo({ top: 0, left: 0, behavior: 'instant' });

  document.querySelectorAll<HTMLElement>('[data-timeline-track]').forEach((track) => {
    track.scrollTo({ left: 0, top: 0, behavior: 'instant' });
  });
}

function getHorizontalScrollContainer(element: HTMLElement): HTMLElement | null {
  const timelineTrack = element.closest<HTMLElement>('[data-timeline-track]');
  if (timelineTrack) {
    return timelineTrack;
  }

  let parent = element.parentElement;

  while (parent) {
    if (isScrollableOverflow(getComputedStyle(parent).overflowX)) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return null;
}

function resolveScrollTarget(element: HTMLElement): HTMLElement {
  return (
    element.closest<HTMLElement>('[data-scroll-activity]') ??
    element.closest<HTMLElement>('[data-timeline-post]') ??
    element
  );
}

function scrollAxisIntoView(
  container: HTMLElement,
  element: HTMLElement,
  behavior: ScrollBehavior,
  axis: 'x' | 'y',
  bottomInset = 0,
) {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  if (axis === 'x') {
    if (container.scrollWidth <= container.clientWidth) {
      return;
    }

    let delta = 0;
    if (elementRect.right > containerRect.right) {
      delta = elementRect.right - containerRect.right;
    } else if (elementRect.left < containerRect.left) {
      delta = elementRect.left - containerRect.left;
    }

    if (delta !== 0) {
      container.scrollBy({ left: delta, behavior });
    }

    return;
  }

  const visibleBottom = containerRect.bottom - bottomInset;
  let delta = 0;

  if (elementRect.bottom > visibleBottom) {
    delta = elementRect.bottom - visibleBottom;
  } else if (elementRect.top < containerRect.top) {
    delta = elementRect.top - containerRect.top;
  }

  if (delta !== 0) {
    container.scrollBy({ top: delta, behavior });
  }
}

export function scrollActivityIntoView(
  element: HTMLElement | null | undefined,
  options: { behavior?: ScrollBehavior } = {},
) {
  if (!element) {
    return;
  }

  const { behavior = 'smooth' } = options;
  const target = resolveScrollTarget(element);
  const bottomInset = getBottomInsetPx();

  const horizontalContainer = getHorizontalScrollContainer(target);
  if (horizontalContainer) {
    scrollAxisIntoView(horizontalContainer, target, behavior, 'x');
  }

  const verticalContainer = getBoardScrollContainer();
  if (verticalContainer) {
    scrollAxisIntoView(verticalContainer, target, behavior, 'y', bottomInset);
    return;
  }

  target.scrollIntoView({ behavior, block: 'nearest', inline: 'nearest' });
}

export function scrollActivityIntoViewAfterLayout(
  element: HTMLElement | null | undefined,
  options: { behavior?: ScrollBehavior } = {},
) {
  if (!element) {
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollActivityIntoView(element, options);
    });
  });
}
