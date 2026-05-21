// Centralized configuration for the frontend
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export {
  getStoredUser,
  saveAuthSession,
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  getAuthHeaders,
  authFetch,
  authFetchJson,
  refreshAccessToken,
  ensureValidSession,
  logoutAuth,
} from './utils/auth';
