import type { CSSProperties, ReactNode } from 'react';
import styles from './ThoughtBubble.module.css';

interface ThoughtBubbleProps {
  color?: string;
  children: ReactNode;
  className?: string;
}

export default function ThoughtBubble({
  color = '#ffffff',
  children,
  className,
}: ThoughtBubbleProps) {
  const bubbleClassName = [styles.bubblePost, className].filter(Boolean).join(' ');
  const bubbleStyle = { '--bubble-color': color } as CSSProperties;

  return (
    <article className={bubbleClassName} style={bubbleStyle}>
      <div className={styles.bubble} style={{ background: color }}>
        <div className={styles.bubbleInner}>{children}</div>
      </div>
    </article>
  );
}
