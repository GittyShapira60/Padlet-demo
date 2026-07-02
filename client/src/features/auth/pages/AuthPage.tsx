import { Navigate, useLocation } from 'react-router-dom';
import AuthCard from '../components/AuthCard/AuthCard';
import styles from './AuthPage.module.css';
import { useAuthPage } from './useAuthPage';

export default function AuthPage() {
  const {
    isLoggedIn,
    mode,
    setMode,
    username,
    setUsername,
    password,
    setPassword,
    error,
    isSubmitting,
    handleSubmit,
  } = useAuthPage();

  const { state } = useLocation();
  const redirectTo = (state as { from?: string } | null)?.from ?? '/';

  if (isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <main className={styles.page}>
      <AuthCard
        mode={mode}
        username={username}
        password={password}
        error={error}
        isSubmitting={isSubmitting}
        onModeChange={setMode}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
