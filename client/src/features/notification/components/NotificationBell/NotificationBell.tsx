import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from '../../../../shared/icons';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../types/notification';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import styles from './NotificationBell.module.css';

export default function NotificationBell() {
  const { notifications, unreadCount, deleteNotification, markAllRead } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  function handleToggle() {
    setIsOpen((prev) => !prev);
  }

  function handleNotificationClick(notification: Notification) {
    void deleteNotification(notification.id);
    if (notification.padletId) {
      void navigate(`/padlets/${notification.padletId}`);
    }
    setIsOpen(false);
  }

  function handleMarkAllRead() {
    void markAllRead();
    setIsOpen(false);
  }

  return (
    <div className={styles.root}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.bell}
        onClick={handleToggle}
      >
        <Bell size={18} strokeWidth={1.5} />
        {unreadCount > 0 ? (
          <span className={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <NotificationDropdown
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={handleMarkAllRead}
          />
        </>
      ) : null}
    </div>
  );
}
