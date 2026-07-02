import { Hand } from '../../../../shared/icons';
import PageHero from '../../../../shared/components/PageHero/PageHero';
import styles from './HomeHero.module.css';

interface HomeHeroProps {
  username: string;
}

export default function HomeHero({ username }: HomeHeroProps) {
  return (
    <PageHero
      title={
        <span className={styles.titleInner}>
          <Hand className={styles.icon} size={26} />
          <span>
            שלום, <bdi>{username}</bdi>!
          </span>
        </span>
      }
      subtitle="הלוחות השיתופיים שלך"
    />
  );
}
