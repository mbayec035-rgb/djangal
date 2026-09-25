export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function formatDate(value, options = {}) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(value));
}

export function formatRelativeDate(value) {
  if (!value) return 'Aucune activité';
  const date = new Date(value);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
  const ranges = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.345, 'week'],
    [12, 'month'],
    [Infinity, 'year'],
  ];

  let amount = seconds;
  for (const [amountNeeded, unit] of ranges) {
    if (Math.abs(amount) < amountNeeded) return formatter.format(Math.round(amount), unit);
    amount /= amountNeeded;
  }
  return formatDate(value);
}

export function courseIconName(icon) {
  return String(icon || 'code-2')
    .replace(/-2$/, '2')
    .replace('git-branch', 'git-branch')
    .toLowerCase();
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count > 1 ? plural : singular}`;
}
