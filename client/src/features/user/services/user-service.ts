import type { User } from '../../../shared/interfaces/user';
import { httpClient } from '../../../shared/services';

export function getUsers(): Promise<User[]> {
  return httpClient<User[]>('users');
}
