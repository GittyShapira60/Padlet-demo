import { Pin } from '../../../../shared/icons';
import styles from './AuthHeader.module.css';

export default function AuthHeader() {
  return (
    <header className={styles.header}>
      <Pin className={styles.logo} size={32} aria-hidden="true" />
      <h2 className={styles.title}>Padlet</h2>
      <p className={styles.tagline}>לוח שיתופי חכם</p>
    </header>
  );
}
