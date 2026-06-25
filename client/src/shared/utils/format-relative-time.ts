const relativeTimeFormatter = new Intl.RelativeTimeFormat('he', {
  numeric: 'auto',
});

export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return 'לפני פחות מדקה';
  }

  if (diffMinutes < 60) {
    return relativeTimeFormatter.format(-diffMinutes, 'minute');
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return relativeTimeFormatter.format(-diffHours, 'hour');
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return relativeTimeFormatter.format(-diffDays, 'day');
  }

  return new Date(isoDate).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
  });
}
