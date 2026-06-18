import { useEffect, useState } from 'react';
import type { User } from '../../../shared/interfaces/user';
import { getUsers } from '../../user/services/user-service';

export function useUsers() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      setUsersLoading(true);
      setUsersError('');

      try {
        const users = await getUsers();

        if (isMounted) {
          setAllUsers(users);
        }
      } catch {
        if (isMounted) {
          setUsersError('לא הצלחנו לטעון את רשימת המשתמשים');
        }
      } finally {
        if (isMounted) {
          setUsersLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    allUsers,
    usersLoading,
    usersError,
  };
}
