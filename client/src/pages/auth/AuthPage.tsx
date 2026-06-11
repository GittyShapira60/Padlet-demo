import { Navigate } from 'react-router-dom';
import AuthCard from '../../components/auth/AuthCard/AuthCard';
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

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
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
