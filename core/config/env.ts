/** Single source of truth for the target environment. */
export const BASE_URL =
  process.env.BASE_URL ?? 'https://testing.platformforge.dev';
export const API_BASE_URL = `${BASE_URL}/api/`;
