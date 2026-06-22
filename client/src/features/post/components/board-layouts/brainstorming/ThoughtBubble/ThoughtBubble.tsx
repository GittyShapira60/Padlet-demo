import { useMemo, type ReactNode } from 'react';
import cloudShapeSvg from './cloud-shape.svg?raw';
import styles from './ThoughtBubble.module.css';

const CLOUD_COLOR_TOKEN = '__CLOUD_COLOR__';
const DEFAULT_CLOUD_COLOR = '#FFF3A1';

interface ThoughtBubbleProps {
  color?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function ThoughtBubble({
  color = DEFAULT_CLOUD_COLOR,
  children,
  footer,
  className,
}: ThoughtBubbleProps) {
  const bubbleClassName = [styles.bubblePost, className].filter(Boolean).join(' ');

  const cloudMarkup = useMemo(
    () => cloudShapeSvg.split(CLOUD_COLOR_TOKEN).join(color),
    [color],
  );

  return (
    <article className={bubbleClassName}>
      <div className={styles.bubbleWrapper}>
        <div
          className={styles.bubbleBg}
          dangerouslySetInnerHTML={{ __html: cloudMarkup }}
        />
        <div className={styles.postContentSafeZone}>
          <div className={styles.textBody}>{children}</div>
          {footer ? <div className={styles.bubbleFooter}>{footer}</div> : null}
        </div>
      </div>
    </article>
  );
}
