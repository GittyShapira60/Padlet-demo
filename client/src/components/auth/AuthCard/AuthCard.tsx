import type { FormEvent } from 'react';
import { AuthMode as AuthModeValues, type AuthMode } from '../../../enums/auth-mode';
import AuthForm from '../AuthForm/AuthForm';
import AuthHeader from '../AuthHeader/AuthHeader';
import AuthTabs from '../AuthTabs/AuthTabs';
import styles from './AuthCard.module.css';

interface AuthCardProps {
  mode: AuthMode;
  username: string;
  password: string;
  error: string;
  isSubmitting: boolean;
  onModeChange: (mode: AuthMode) => void;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function AuthCard({
  mode,
  username,
  password,
  error,
  isSubmitting,
  onModeChange,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: AuthCardProps) {
  const isLogin = mode === AuthModeValues.Login;

  return (
    <section className={styles.card}>
      <AuthHeader />
      <AuthTabs activeMode={mode} onModeChange={onModeChange} />
      <AuthForm
        mode={mode}
        username={username}
        password={password}
        error={error}
        isSubmitting={isSubmitting}
        onUsernameChange={onUsernameChange}
        onPasswordChange={onPasswordChange}
        onSubmit={onSubmit}
      />
      <p className={styles.hint}>
        {isLogin ? 'משתמש חדש? עבור לכרטיסיית הרשמה' : 'כבר נרשמת? עבור לכרטיסיית כניסה'}
      </p>
    </section>
  );
}
