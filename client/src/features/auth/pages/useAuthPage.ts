import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthMode as AuthModeValues, type AuthMode } from '../enums/auth-mode';
import { useAuth } from '../context/AuthProvider';
import { getAuthErrorMessage } from '../utils/get-auth-error-message';

export function useAuthPage() {
  const { isLoggedIn, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>(AuthModeValues.Login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setError('');
  }, [mode]);

  function validateForm(): string | null {
    if (mode !== AuthModeValues.Register) return null;

    if (!username.trim()) return 'שם משתמש הוא שדה חובה';
    if (username.trim().length < 3) return 'שם משתמש חייב להכיל לפחות 3 תווים';
    if (username.trim().length > 15) return 'שם משתמש לא יכול לעלות על 15 תווים';
    if (!password) return 'סיסמה היא שדה חובה';
    if (password.length < 6) return 'סיסמה חייבת להכיל לפחות 6 תווים';
    if (password.length > 15) return 'סיסמה לא יכולה לעלות על 15 תווים';
    if (!/[!@#$%^&*]/.test(password)) return 'סיסמה חייבת להכיל לפחות סימן אחד מ: ! @ # $ % ^ & *';

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === AuthModeValues.Login) {
        await login(username, password);
      } else {
        await register(username, password);
      }

      navigate('/', { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err, mode));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleModeChange(newMode: AuthMode) {
    setMode(newMode);
    setError('');
  }

  function validateUsername(value: string): string {
    const v = value.trim();
    if (!v) return '';
    if (v.length < 3) return 'שם משתמש חייב להכיל לפחות 3 תווים';
    if (v.length > 15) return 'שם משתמש לא יכול לעלות על 15 תווים';
    return '';
  }

  function validatePassword(value: string): string {
    if (!value) return '';
    if (value.length < 6) return 'סיסמה חייבת להכיל לפחות 6 תווים';
    if (value.length > 15) return 'סיסמה לא יכולה לעלות על 15 תווים';
    if (!/[!@#$%^&*]/.test(value)) return 'סיסמה חייבת להכיל לפחות סימן אחד מ: ! @ # $ % ^ & *';
    return '';
  }

  function handleUsernameChange(value: string) {
    setUsername(value);
    setError(mode === AuthModeValues.Register ? validateUsername(value) : '');
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    setError(mode === AuthModeValues.Register ? validatePassword(value) : '');
  }

  return {
    isLoggedIn,
    mode,
    setMode: handleModeChange,
    username,
    setUsername: handleUsernameChange,
    password,
    setPassword: handlePasswordChange,
    error,
    isSubmitting,
    handleSubmit,
  };
}
