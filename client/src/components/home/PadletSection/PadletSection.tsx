import type { ReactNode } from 'react';
import styles from './PadletSection.module.css';

interface PadletSectionProps {
  title: string;
  count: number;
  badgeColor?: 'orange' | 'blue';
  children: ReactNode;
}

export default function PadletSection({
  title,
  count,
  badgeColor = 'orange',
  children,
}: PadletSectionProps) {
  const badgeVariant =
    badgeColor === 'blue' ? styles.badgeBlue : styles.badgeOrange;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <span className={`${styles.badge} ${badgeVariant}`}>{count}</span>
      </div>
      {children}
    </section>
  );
}
