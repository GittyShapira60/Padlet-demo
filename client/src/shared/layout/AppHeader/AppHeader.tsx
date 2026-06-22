import { useAuth } from '../../../features/auth/context/AuthProvider';
import { BarChart3, Bell,  LogOut } from '../../icons';
import styles from './AppHeader.module.css';

export default function AppHeader() {
  const { user, logout } = useAuth();
  const username = user?.username ?? 'משתמש';
  const initial = username.charAt(0).toUpperCase();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img
            src="/main-icon.svg"
            alt=""
            className={styles.logoIcon}
          />
          <span className={styles.logo}>Padlet</span>
        </div>

        <nav className={styles.actions}>
          <button type="button" className={styles.stats}>
            <BarChart3 size={17} strokeWidth={1.5} />
            סטטיסטיקות
          </button>

          <span className={styles.greeting}>שלום, {username}</span>

          <button type="button" className={styles.bell}>
            <Bell size={18} strokeWidth={1.5} />
            <span className={styles.bellBadge}>1</span>
          </button>

          <div className={styles.avatar}>
            {initial}
          </div>

          <button type="button" className={styles.logout} onClick={logout}>
            <LogOut size={17} strokeWidth={1.5} />
            יציאה
          </button>
        </nav>
      </div>
    </header>
  );
}
