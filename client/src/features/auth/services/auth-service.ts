import type { User } from '../../../shared/interfaces/user';
import { clearAuthData, setAuthData } from '../utils/auth-token-storage';
import { httpClient } from '../../../shared/services/http-client';

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

  setAuthData(data);
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
  clearAuthData();
}
