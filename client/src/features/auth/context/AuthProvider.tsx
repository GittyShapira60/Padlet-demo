import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '../../../shared/interfaces/user';
import * as authService from '../services/auth-service';
import { getAuthData } from '../utils/auth-token-storage';

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(
    () => getAuthData()?.user ?? null,
  );

  const login = useCallback(async (username: string, password: string) => {
    const { user: loggedInUser } = await authService.login(username, password);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const { user: registeredUser } = await authService.register(
      username,
      password,
    );
    setUser(registeredUser);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  useEffect(() => {
    function syncAuthFromStorage() {
      setUser(getAuthData()?.user ?? null);
    }

    window.addEventListener('storage', syncAuthFromStorage);
    return () => window.removeEventListener('storage', syncAuthFromStorage);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: user !== null,
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
