import { CloudinaryResource } from '@/features/company/types';
import api from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

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

/**
 * Fetch a proxied file through the authed API client (the proxy now requires
 * a bearer token), then open it in a new tab from an in-memory blob URL.
 */
export async function openFileProxy(
  file: string | CloudinaryResource | null | undefined,
): Promise<void> {
  const proxyUrl = getFileProxyUrl(file);
  if (!proxyUrl) return;
  try {
    const path = proxyUrl.startsWith(API_BASE_URL)
      ? proxyUrl.slice(API_BASE_URL.length)
      : proxyUrl;
    const { data } = await api.get(path, { responseType: 'blob' });
    const blobUrl = URL.createObjectURL(data);
    window.open(blobUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch {
    toastHelper.error('Could not open the file. Please try again.');
  }
}
