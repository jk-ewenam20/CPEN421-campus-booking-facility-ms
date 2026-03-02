// ─── API Client ──────────────────────────────────────────────────────────────
// Wraps all backend calls. Uses session cookies + localStorage for Safari compat.
// For Safari: localStorage persists cookies when they fail due to strict policies

const BASE = import.meta.env.VITE_API_BASE_URL || '';
const STORAGE_KEY = 'cbms_user';
const TOKEN_STORAGE_KEY = 'cbms_token';

// ─── Storage Helpers ─────────────────────────────────────────────────────────
// Use localStorage for persistence (works across Safari tabs/refreshes)
// Fallback to sessionStorage only for non-Safari browsers

export function setAuthUser(userData) {
  if (userData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  } else {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export function getAuthUser() {
  // Try localStorage first (Safari + persistence)
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  // Fallback to sessionStorage
  const session = sessionStorage.getItem(STORAGE_KEY);
  if (session) return JSON.parse(session);
  return null;
}

export function setAuthToken(token) {
  if (token) {
    // Store in both localStorage (persistence) and as Authorization header
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function getAuthToken() {
  // Try localStorage first (Safari + persistence)
  const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (stored) return stored;
  // Fallback to sessionStorage
  return sessionStorage.getItem(TOKEN_STORAGE_KEY) || null;
}

async function request(method, path, body) {
  const opts = {
    method,
    credentials: 'include',  // Always send cookies
    headers: { 'Content-Type': 'application/json' }
  };

  // Add Authorization header with token (Safari fallback when cookies fail)
  const token = getAuthToken();
  if (token) {
    opts.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(BASE + path, opts);
  return res;
}

// Parse response — returns [data, errorMessage]
async function parseResponse(res) {
  const text = await res.text().catch(() => '');

  // Handle 401 - only clear if we thought we were authenticated
  if (res.status === 401) {
    const user = getAuthUser();
    if (user) {
      // Clear all auth data
      setAuthUser(null);
      setAuthToken(null);
      window.location.href = '/login';
      return [null, 'Session expired. Please login again.'];
    }
  }

  if (!text) return [null, null];
  try {
    const json = JSON.parse(text);
    if (!res.ok) {
      const msg = json.message || json.error || JSON.stringify(json);
      return [null, msg];
    }
    return [json, null];
  } catch {
    if (!res.ok) return [null, text || `Request failed (${res.status})`];
    return [text, null];
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  // Clear any old session
  try {
    await fetch(BASE + '/auth/logout', { method: 'POST', credentials: 'include' });
  } catch (err) {
    // Ignore errors
  }
  setAuthUser(null);
  setAuthToken(null);

  // Login with new credentials
  const res = await request('POST', '/auth/login', { email, password });
  const [data, err] = await parseResponse(res);

  if (!err && data) {
    // Store user data in both storages for persistence across Safari
    setAuthUser(data);
    // If backend returns token, store it (for Safari fallback)
    if (data.token) {
      setAuthToken(data.token);
    }
  }

  return [data, err];
}

export async function logout() {
  try {
    await request('POST', '/auth/logout');
  } catch (err) {
    // Ignore errors
  }
  setAuthUser(null);
  setAuthToken(null);
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function registerUser(data) {
  const res = await request('POST', '/users', data);
  return parseResponse(res);
}

export async function getAllUsers() {
  const res = await request('GET', '/users');
  return parseResponse(res);
}

export async function getUser(id) {
  const res = await request('GET', `/users/${id}`);
  return parseResponse(res);
}

export async function updateUser(id, data) {
  const res = await request('PUT', `/users/${id}`, data);
  return parseResponse(res);
}

export async function deleteUser(id) {
  const res = await request('DELETE', `/users/${id}`);
  return parseResponse(res);
}

// ── Facilities ────────────────────────────────────────────────────────────────

export async function getAllFacilities() {
  const res = await request('GET', '/facilities');
  return parseResponse(res);
}

export async function getFacility(id) {
  const res = await request('GET', `/facilities/${id}`);
  return parseResponse(res);
}

export async function createFacility(data) {
  const res = await request('POST', '/facilities', data);
  return parseResponse(res);
}

export async function updateFacility(id, data) {
  const res = await request('PUT', `/facilities/${id}`, data);
  return parseResponse(res);
}

export async function deleteFacility(id) {
  const res = await request('DELETE', `/facilities/${id}`);
  return parseResponse(res);
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export async function getAllBookings() {
  const res = await request('GET', '/bookings');
  return parseResponse(res);
}

export async function createBooking(data) {
  const res = await request('POST', '/bookings', data);
  return parseResponse(res);
}

export async function updateBooking(id, data) {
  const res = await request('PUT', `/bookings/${id}`, data);
  return parseResponse(res);
}

export async function cancelBooking(id) {
  const res = await request('DELETE', `/bookings/${id}`);
  return parseResponse(res);
}

export async function checkAvailability(facilityId, date, startTime, endTime) {
  const params = new URLSearchParams({ facilityId, date, startTime, endTime });
  const res = await request('GET', `/bookings/availability?${params}`);
  return parseResponse(res);
}

// ── Session Validation ────────────────────────────────────────────────────────
// For Safari: validate session is still alive when app starts
export async function validateSession() {
  const user = getAuthUser();
  if (!user) return [null, 'No user'];

  // Make a simple request to validate cookie/token still works
  try {
    const res = await request('GET', '/bookings');
    const [, err] = await parseResponse(res);
    if (err) return [null, err];
    return [user, null];
  } catch (e) {
    return [null, e?.message || 'Session validation failed'];
  }
}
