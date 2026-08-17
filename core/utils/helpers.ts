export function normalizePrice(value: string) {
  return Number(value.replace(/[^0-9]/g, ''));
}

export function getRandomString(prefix = 'test') {
  return `${prefix}-${Date.now()}`;
}
