export function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function parseBoolean(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

export function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function notFound(res, resource = 'Ressource') {
  return res.status(404).json({ message: `${resource} introuvable.` });
}

export function isUniqueConstraint(error) {
  return String(error?.message || '').includes('UNIQUE constraint failed');
}
