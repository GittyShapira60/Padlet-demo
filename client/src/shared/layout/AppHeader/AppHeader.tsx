import type { ReactNode } from 'react';
import { useAuth } from '../../../features/auth/context/AuthProvider';
import { BarChart3, Bell, LogOut } from '../../icons';
import styles from './AppHeader.module.css';

interface AppHeaderProps {
  centerSlot?: ReactNode;
  background?: string | null;
  onLogoClick?: () => void;
}

export default function AppHeader({
  centerSlot,
  background,
  onLogoClick,
}: AppHeaderProps) {
  const { user, logout } = useAuth();
  const username = user?.username ?? 'משתמש';
  const initial = username.charAt(0).toUpperCase();

  return (
    <header
      className={`${styles.header} ${background ? styles.noBorder : ''}`}
      style={background ? { background } : undefined}
    >
      <div className={styles.inner}>
        <div className={styles.rightGroup}>
          <button
            type="button"
            className={styles.brand}
            onClick={onLogoClick}
            aria-label="חזרה לבית"
          >
            <img
              src="/main-icon.svg"
              alt=""
              className={styles.logoIcon}
              aria-hidden="true"
            />
            <span className={styles.logo}>Padlet</span>
          </button>

          {centerSlot ? (
            <div className={styles.centerSlot}>{centerSlot}</div>
          ) : null}
        </div>

        <div className={styles.leftGroup}>

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

          <button type="button" className={styles.bell} aria-label="התראות">
            <Bell size={18} strokeWidth={1.5} aria-hidden="true" />
            <span className={styles.bellBadge}>1</span>
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

          <div className={styles.avatar} aria-hidden="true">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
