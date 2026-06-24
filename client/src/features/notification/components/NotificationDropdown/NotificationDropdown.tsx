import type { Notification, NotificationType } from '../../types/notification';
import styles from './NotificationDropdown.module.css';

const TYPE_LABELS: Record<NotificationType, string> = {
  reaction: 'הגיב/ה לפוסט שלך',
  comment: 'הגיב/ה בתגובה על פוסט שלך',
  new_post: 'פרסם/ה פוסט חדש בלוח',
  padlet_share: 'שיתף/ה איתך לוח',
};

interface NotificationDropdownProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllRead: () => void;
}

export default function NotificationDropdown({
  notifications,
  onNotificationClick,
  onMarkAllRead,
}: NotificationDropdownProps) {
  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <span className={styles.title}>התראות</span>
        {notifications.some((n) => !n.isRead) ? (
          <button
            type="button"
            className={styles.markAll}
            onClick={onMarkAllRead}
          >
            סמן הכל כנקרא
          </button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <p className={styles.empty}>אין התראות</p>
      ) : (
        <ul className={styles.list}>
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`${styles.item} ${notification.isRead ? styles.read : styles.unread}`}
              onClick={() => onNotificationClick(notification)}
            >
              <span className={styles.actor}>{notification.actorUsername}</span>
              <span className={styles.label}>
                {TYPE_LABELS[notification.type]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
