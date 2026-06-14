import type { FormEvent } from 'react';
import { AuthMode as AuthModeValues, type AuthMode } from '../../enums/auth-mode';
import AuthField from '../AuthField/AuthField';
import styles from './AuthForm.module.css';

interface AuthFormProps {
  mode: AuthMode;
  username: string;
  password: string;
  error: string;
  isSubmitting: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function AuthForm({
  mode,
  username,
  password,
  error,
  isSubmitting,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: AuthFormProps) {
  const isLogin = mode === AuthModeValues.Login;
  const submitLabel = isSubmitting
    ? isLogin
      ? 'מתחברת...'
      : 'נרשמת...'
    : isLogin
      ? 'כניסה'
      : 'הרשמה';

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error ? <p className={styles.error}>{error}</p> : null}

      <AuthField
        id="username"
        label="שם משתמש"
        type="text"
        placeholder="הכנס שם משתמש"
        autoComplete="username"
        value={username}
        onChange={onUsernameChange}
      />

      <AuthField
        id="password"
        label="סיסמה"
        type="password"
        placeholder="הכנס סיסמה"
        autoComplete={isLogin ? 'current-password' : 'new-password'}
        value={password}
        onChange={onPasswordChange}
      />

      <button type="submit" className={styles.submit} disabled={isSubmitting}>
        {submitLabel}
      </button>
    </form>
  );
}
