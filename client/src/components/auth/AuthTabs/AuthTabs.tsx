import { AuthMode as AuthModeValues, type AuthMode } from '../../../enums/auth-mode';
import styles from './AuthTabs.module.css';

interface AuthTabsProps {
  activeMode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export default function AuthTabs({ activeMode, onModeChange }: AuthTabsProps) {
  const loginTabClass =
    activeMode === AuthModeValues.Login
      ? `${styles.tab} ${styles.tabActive}`
      : styles.tab;
  const registerTabClass =
    activeMode === AuthModeValues.Register
      ? `${styles.tab} ${styles.tabActive}`
      : styles.tab;

  return (
    <div className={styles.tabs} role="tablist" aria-label="סוג התחברות">
      <button
        type="button"
        role="tab"
        aria-selected={activeMode === AuthModeValues.Login}
        className={loginTabClass}
        onClick={() => onModeChange(AuthModeValues.Login)}
      >
        כניסה
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeMode === AuthModeValues.Register}
        className={registerTabClass}
        onClick={() => onModeChange(AuthModeValues.Register)}
      >
        הרשמה
      </button>
    </div>
  );
}
