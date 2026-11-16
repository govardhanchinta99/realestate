import axios from 'axios';

// Safely determine API base URL without trailing slash
const envUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = (envUrl && typeof envUrl === 'string' && envUrl !== 'undefined')
  ? envUrl.replace(/\/+$/, '')
  : '';

/**
 * Returns full API URL for a given path
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    return cleanPath;
  }
  return `${API_BASE_URL}${cleanPath}`;
}

export const apiClient = axios.create({
  timeout: 10000,
});

export default apiClient;
