// ─── API Client ──────────────────────────────────────────────────────────────
// Wraps all backend calls. Uses session cookies (credentials: 'include').
// On 401 it clears auth and redirects to login.

const BASE = import.meta.env.VITE_API_BASE_URL || '';  // Empty = Vite proxy (dev), full URL (prod)

async function request(method, path, body) {
  const opts = { method, credentials: 'include' };
  if (body !== undefined) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(BASE + path, opts);

  if (res.status === 401) {
    sessionStorage.removeItem('cbms_user');
    window.location.href = '/';
    throw new Error('Unauthorized');
  }

  return res;
}

// Parse response — returns [data, errorMessage]
async function parseResponse(res) {
  const text = await res.text().catch(() => '');
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
  // Clear any existing session FIRST before logging in as new user
  // This ensures clean session switching on mobile browsers
  // Use fetch directly to avoid request() 401 redirect for new users
  try {
    await fetch(BASE + '/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (err) {
    // Logout may fail if no session exists — that's OK
    console.log('Previous session cleared or did not exist');
  }
  sessionStorage.removeItem('cbms_user');

  // Now login with new credentials
  const res = await request('POST', '/auth/login', { email, password });
  return parseResponse(res);
}

export async function logout() {
  try { await request('POST', '/auth/logout'); } catch {}
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
