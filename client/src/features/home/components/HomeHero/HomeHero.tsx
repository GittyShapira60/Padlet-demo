import { Hand } from '../../../../shared/icons';
import styles from './HomeHero.module.css';

interface HomeHeroProps {
  username: string;
}

export default function HomeHero({ username }: HomeHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h2 className={styles.title}>
          <Hand className={styles.icon} size={26} />
          !שלום, {username}
        </h2>
        <p className={styles.subtitle}>הלוחות השיתופיים שלך</p>
      </div>
    </section>
  );
}
