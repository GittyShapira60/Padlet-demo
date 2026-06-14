import type { User } from '../interfaces/user';

const STORAGE_KEY = 'padlet_auth_token';

export interface AuthData {
  token: string;
  user: User;
}

export function getAuthData(): AuthData | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthData;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function setAuthData(authData: AuthData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
}

export function clearAuthData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
