import { type FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthMode as AuthModeValues, type AuthMode } from '../enums/auth-mode';
import { useAuth } from '../context/AuthProvider';
import { getAuthErrorMessage } from '../utils/get-auth-error-message';

export function useAuthPage() {
  const { isLoggedIn, login, register } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const rawRedirect = (state as { from?: string } | null)?.from;
  const redirectTo = rawRedirect?.startsWith('/') ? rawRedirect : '/';
  const [mode, setMode] = useState<AuthMode>(AuthModeValues.Login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === AuthModeValues.Login) {
        await login(username, password);
      } else {
        await register(username, password);
      }

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err, mode));
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
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
  };
}
