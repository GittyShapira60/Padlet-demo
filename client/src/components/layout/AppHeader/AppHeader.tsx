import { useAuth } from '../../../providers/AuthProvider';
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
            aria-hidden="true"
          />
          <span className={styles.logo}>Padlet</span>
        </div>

        <nav className={styles.actions} aria-label="פעולות משתמש">
          <button type="button" className={styles.stats}>
            <BarChart3 size={17} strokeWidth={1.5} aria-hidden="true" />
            סטטיסטיקות
          </button>

          <span className={styles.greeting}>שלום, {username}</span>

          <button type="button" className={styles.bell} aria-label="התראות">
            <Bell size={18} strokeWidth={1.5} aria-hidden="true" />
            <span className={styles.bellBadge}>1</span>
          </button>

          <div className={styles.avatar} aria-hidden="true">
            {initial}
          </div>

          <button type="button" className={styles.logout} onClick={logout}>
            <LogOut size={17} strokeWidth={1.5} aria-hidden="true" />
            יציאה
          </button>
        </nav>
      </div>
    </header>
  );
}
