import type { User } from '../interfaces/user';
import { clearSession, setSession } from '../utils/auth-session';
import { httpClient } from './http-client';

export interface LoginResponse {
  token: string;
  user: User;
}

async function authenticate(
  endpoint: 'login' | 'register',
  username: string,
  password: string,
): Promise<LoginResponse> {
  const data = await httpClient<LoginResponse>(`auth/${endpoint}`, {
    method: 'POST',
    body: { username, password },
  });

  setSession(data);
  return data;
}

export function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  return authenticate('login', username, password);
}

export function register(
  username: string,
  password: string,
): Promise<LoginResponse> {
  return authenticate('register', username, password);
}

export function logout(): void {
  clearSession();
}
