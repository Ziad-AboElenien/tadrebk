import { CloudinaryResource } from '@/types/company';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

export function getFileProxyUrl(
  file: string | CloudinaryResource | null | undefined,
): string | null {
  if (!file) return null;
  const url = typeof file === 'string' ? file : file.secure_url;
  if (!url) return null;
  if (url.startsWith(API_BASE_URL)) return url;
  return `${API_BASE_URL}/file-proxy/resume.pdf?url=${encodeURIComponent(url)}`;
}
