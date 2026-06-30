import type { CSSProperties, ReactNode } from 'react';
import { useAuth } from '../../../features/auth/context/AuthProvider';
import { NotificationBell } from '../../../features/notification';
import { BarChart3, LogOut } from '../../icons';
import { isLightBackground } from '../../constants/background-colors';
import styles from './AppHeader.module.css';

interface AppHeaderProps {
  centerSlot?: ReactNode;
  background?: string | null;
  actionSlot?: ReactNode;
  onLogoClick?: () => void;
}

export default function AppHeader({
  centerSlot,
  background,
  actionSlot,
  onLogoClick,
}: AppHeaderProps) {
  const { user, logout } = useAuth();
  const username = user?.username ?? 'משתמש';
  const initial = username.charAt(0).toUpperCase();

  const headerVars: CSSProperties | undefined = background
    ? isLightBackground(background)
      ? ({
          '--header-icon-color': '#1f2937',
          '--header-btn-bg': 'rgba(255, 255, 255, 0.22)',
          '--header-btn-bg-hover': 'rgba(255, 255, 255, 0.35)',
          '--header-btn-border': 'rgba(255, 255, 255, 0.4)',
        } as CSSProperties)
      : ({
          '--header-icon-color': '#ffffff',
          '--header-btn-bg': 'rgba(0, 0, 0, 0.18)',
          '--header-btn-bg-hover': 'rgba(0, 0, 0, 0.3)',
          '--header-btn-border': 'rgba(255, 255, 255, 0.15)',
        } as CSSProperties)
    : undefined;

  return (
    <header
      className={`${styles.header} ${background ? styles.noBorder : ''}`}
      style={headerVars}
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

        <nav className={styles.actions}>
          {actionSlot ?? null}

          <button type="button" className={styles.stats}>
            <BarChart3 size={17} strokeWidth={1.5} />
            סטטיסטיקות
          </button>

          <NotificationBell />

          <button type="button" className={styles.logout} onClick={logout}>
            <LogOut size={17} strokeWidth={1.5} />
            יציאה
          </button>

          <div className={styles.avatar} aria-hidden="true">
            {initial}
          </div>
        </nav>
      </div>
    </header>
  );
}
