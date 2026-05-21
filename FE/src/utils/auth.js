import { API_URL } from "../config";

const USER_KEY = "userInfo";

let refreshInFlight = null;

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveAuthSession(data) {
  // Only store access token and user data, not refresh token
  // Refresh token is now stored in httpOnly cookie by backend
  const { refreshToken, ...sessionData } = data;
  localStorage.setItem(USER_KEY, JSON.stringify(sessionData));
}

export function clearAuthSession() {
  localStorage.removeItem(USER_KEY);
}

export function getAccessToken() {
  return getStoredUser()?.token || null;
}

export function getRefreshToken() {
  // Refresh token is now in httpOnly cookie, not localStorage
  // The browser will automatically send it with requests
  return null;
}

/** Decode JWT exp (seconds) without external lib */
export function isAccessTokenExpiringSoon(token, bufferSeconds = 120) {
  if (!token) return true;
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (!payload.exp) return true;
    return payload.exp * 1000 <= Date.now() + bufferSeconds * 1000;
  } catch {
    return true;
  }
}

export function getAuthHeaders(extraHeaders = {}) {
  const token = getAccessToken();
  const headers = { ...extraHeaders };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function refreshAccessToken() {
  const user = getStoredUser();
  // Refresh token is now in httpOnly cookie, sent automatically by browser
  // No need to include it in request body

  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important: include cookies
      // No body needed - refresh token is in httpOnly cookie
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw data;
    }
    const merged = { ...user, ...data.data };
    saveAuthSession(merged);
    return merged;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

/** Refresh proactively when access token is near expiry */
export async function ensureValidSession() {
  const user = getStoredUser();
  if (!user?.token) return null;
  // Refresh token is now in httpOnly cookie, no need to check user.refreshToken
  if (!isAccessTokenExpiringSoon(user.token)) return user;
  return refreshAccessToken();
}

/**
 * fetch wrapper: retries once after refreshing access token on TOKEN_EXPIRED
 */
const shouldAttemptRefresh = (status, body) => {
  if (status !== 401) return false;
  // Refresh token is now in httpOnly cookie, no need to check getRefreshToken()
  if (body?.code === "TOKEN_EXPIRED") return true;
  const msg = (body?.message || "").toLowerCase();
  return (
    msg.includes("hết hạn") ||
    msg.includes("token không hợp lệ") ||
    msg.includes("invalid")
  );
};

export async function authFetch(url, options = {}) {
  const isFormData = options.body instanceof FormData;

  const buildInit = () => {
    const extra =
      options.headers instanceof Headers
        ? Object.fromEntries(options.headers.entries())
        : { ...(options.headers || {}) };
    if (isFormData) delete extra["Content-Type"];
    return {
      ...options,
      headers: getAuthHeaders(extra),
      credentials: "include", // Important: include cookies for httpOnly refresh token
    };
  };

  let res = await fetch(url, buildInit());

  if (res.status === 401) {
    let body = {};
    try {
      body = await res.clone().json();
    } catch {
      /* ignore */
    }
    if (shouldAttemptRefresh(res.status, body)) {
      try {
        await refreshAccessToken();
        res = await fetch(url, buildInit());
      } catch {
        clearAuthSession();
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login")
        ) {
          window.location.href = "/login";
        }
        throw new Error("SESSION_EXPIRED");
      }
    }
  }

  return res;
}

/** JSON helper built on authFetch */
export async function authFetchJson(url, options = {}) {
  const res = await authFetch(url, options);
  const data = await res.json();
  return { res, data };
}

export async function logoutAuth() {
  const token = getAccessToken();
  if (token) {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        credentials: "include", // Important: include cookies for httpOnly refresh token
      });
    } catch {
      /* best effort */
    }
  }
  clearAuthSession();
}
