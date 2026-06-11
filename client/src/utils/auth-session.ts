import type { User } from '../interfaces/user';

const STORAGE_KEY = 'padlet_auth_session';

export interface AuthSession {
  token: string;
  user: User;
}

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function setSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
