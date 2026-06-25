export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return 'לפני פחות מדקה';
  }

  if (diffMinutes < 60) {
    return `לפני ${diffMinutes} דקות`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `לפני ${diffHours} שעות`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `לפני ${diffDays} ימים`;
  }

  return new Date(isoDate).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
  });
}
