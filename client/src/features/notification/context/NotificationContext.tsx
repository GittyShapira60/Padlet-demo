import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { connectSocket, disconnectSocket } from '../../../shared/services';
import { useAuth } from '../../auth/context/AuthProvider';
import {
  deleteNotification as deleteNotificationApi,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notification-api';
import type { Notification } from '../types/notification';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      loadedRef.current = false;
      disconnectSocket();
      return;
    }

    if (!loadedRef.current) {
      loadedRef.current = true;
      fetchNotifications()
        .then(setNotifications)
        .catch(() => undefined);
    }

    const socket = connectSocket();

    const handleNotification = (incoming: Notification) => {
      setNotifications((prev) => [incoming, ...prev]);
    };
    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [isLoggedIn]);

  const markRead = useCallback(async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    await deleteNotificationApi(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const value = useMemo(
    () => ({ notifications, unreadCount, markRead, markAllRead, deleteNotification }),
    [notifications, unreadCount, markRead, markAllRead, deleteNotification],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider');
  return ctx;
}
