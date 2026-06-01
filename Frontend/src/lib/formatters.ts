export function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  return payload?.results || [];
}

export function formatDate(value) {
  if (!value) return 'No date';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}

export function initials(user) {
  const source = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'U';
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function displayName(user) {
  return `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'Unknown user';
}

export function classNames(...parts) {
  return parts.filter(Boolean).join(' ');
}
