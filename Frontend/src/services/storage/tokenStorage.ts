const TOKEN_KEY = 'workspace_access_token';
const REFRESH_KEY = 'workspace_refresh_token';

export function getAccessToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_KEY);
}

export function setAuthTokens(tokens) {
  sessionStorage.setItem(TOKEN_KEY, tokens.access);
  sessionStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function clearAuthTokens() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}
