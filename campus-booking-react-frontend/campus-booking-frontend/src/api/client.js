// ─── API Client ──────────────────────────────────────────────────────────────
// Wraps all backend calls. Uses session cookies (credentials: 'include').
// Simple, clean implementation for mobile compatibility.

const BASE = import.meta.env.VITE_API_BASE_URL || '';  // Empty = Vite proxy (dev), full URL (prod)

async function request(method, path, body) {
  const opts = {
    method,
    credentials: 'include',  // Send cookies
    headers: { 'Content-Type': 'application/json' }
  };

  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(BASE + path, opts);
  return res;
}

// Parse response — returns [data, errorMessage]
async function parseResponse(res) {
  const text = await res.text().catch(() => '');

  // Only redirect on 401 if we're actually authenticated
  // This prevents false logouts on auth errors
  if (res.status === 401) {
    const user = JSON.parse(sessionStorage.getItem('cbms_user') || 'null');
    // Only redirect if we thought we were logged in
    if (user) {
      sessionStorage.removeItem('cbms_user');
      window.location.href = '/';
      return [null, 'Session expired. Please login again.'];
    }
    // Otherwise just return the error
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
  // Logout first to clear any old session
  try {
    await fetch(BASE + '/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (err) {
    // Ignore logout errors
  }
  sessionStorage.removeItem('cbms_user');

  // Login with new credentials
  const res = await request('POST', '/auth/login', { email, password });
  return parseResponse(res);
}

export async function logout() {
  try {
    await request('POST', '/auth/logout');
  } catch (err) {
    // Ignore errors
  }
  sessionStorage.removeItem('cbms_user');
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
