import type { CSSProperties, ReactNode } from 'react';
import styles from './ThoughtBubble.module.css';

interface ThoughtBubbleProps {
  color?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function ThoughtBubble({
  color = '#ffffff',
  children,
  footer,
  className,
}: ThoughtBubbleProps) {
  const bubbleClassName = [styles.bubblePost, className].filter(Boolean).join(' ');
  const bubbleStyle = { '--bubble-color': color } as CSSProperties;

  return (
    <article className={bubbleClassName} style={bubbleStyle}>
      <div className={styles.bubble} style={{ background: color }}>
        <div className={styles.content}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </article>
  );
}
