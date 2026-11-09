/**
 * Base URL for the NEXORA backend API.
 *
 * Configure it with `VITE_API_URL`; local development falls back to the
 * default backend port. A trailing slash is stripped so callers can safely
 * append paths such as `/api/repositories`.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || 'http://localhost:5000';

export default API_BASE_URL;
