import type { ReactNode } from 'react';
import styles from './PageHero.module.css';

interface PageHeroProps {
  title: ReactNode;
  subtitle?: string;
  leftAction?: ReactNode;
}

export default function PageHero({ title, subtitle, leftAction }: PageHeroProps) {
  return (
    <section className={styles.hero}>
      {leftAction && <div className={styles.leftAction}>{leftAction}</div>}
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </section>
  );
}
