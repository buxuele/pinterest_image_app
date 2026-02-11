import axios from 'axios';

const rawBaseUrl = process.env.REACT_APP_API_BASE_URL || '';
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined
});

export const withBaseUrl = (path) => {
  if (!API_BASE_URL) return path;
  if (!path) return API_BASE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default apiClient;
