import { appConfig } from '../../config/appConfig';
import { getAccessToken } from '../storage/tokenStorage';

function getErrorMessage(data: any) {
  if (data?.detail) return data.detail;
  if (!data || typeof data !== 'object') return 'Request failed';
  return Object.values(data).flat().join(' ') || 'Request failed';
}

export async function httpClient(path: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers || {}) as Record<string, string>)
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getErrorMessage(data));
  }

  return data;
}
