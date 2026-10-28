const API_ORIGIN = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

export function mediaUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_ORIGIN) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}
