// ─── API Client ──────────────────────────────────────────────────────────────
// Wraps all backend calls. Uses session cookies (credentials: 'include').
// Fallback: Uses localStorage for Safari ITP (Intelligent Tracking Prevention)
// On 401 it clears auth and redirects to login.

const BASE = import.meta.env.VITE_API_BASE_URL || '';  // Empty = Vite proxy (dev), full URL (prod)

// Storage key for localStorage fallback (Safari ITP workaround)
const AUTH_STORAGE_KEY = 'cbms_auth_session';

async function request(method, path, body) {
  const opts = {
    method,
    credentials: 'include',  // Send cookies
    headers: { 'Content-Type': 'application/json' }
  };

  // Safari ITP workaround: Add auth info to localStorage as backup
  const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
  if (storedAuth) {
    try {
      const auth = JSON.parse(storedAuth);
      // Add a custom header with auth info as fallback
      // Backend can check this if JSESSIONID cookie is missing
      opts.headers['X-Auth-User'] = auth.id;
    } catch (e) {
      // Ignore parse errors
    }
  }

  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(BASE + path, opts);
    return res;
  } catch (err) {
    console.error('Network error:', err);
    throw err;
  }
}

// Parse response — returns [data, errorMessage]
async function parseResponse(res) {
  const text = await res.text().catch(() => '');

  // Handle 401 Unauthorized
  if (res.status === 401) {
    const user = JSON.parse(sessionStorage.getItem('cbms_user') || 'null');
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

    // If we're supposed to be logged in but got 401, it's a real auth failure
    if (user && !storedAuth) {
      // Session-only mode and got 401 - real logout
      sessionStorage.removeItem('cbms_user');
      window.location.href = '/';
      return [null, 'Session expired. Please login again.'];
    }

    // If we have localStorage auth (Safari ITP fallback), don't redirect
    // Just return the error and let the component handle it
    if (storedAuth) {
      console.log('Got 401 but have localStorage auth - using fallback');
      return [null, null];  // Return empty, component will retry
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
  // Clear any existing session FIRST
  try {
    await fetch(BASE + '/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (err) {
    console.log('Previous session cleared or did not exist');
  }
  sessionStorage.removeItem('cbms_user');
  localStorage.removeItem(AUTH_STORAGE_KEY);

  // Login with new credentials
  const res = await request('POST', '/auth/login', { email, password });
  const [data, err] = await parseResponse(res);

  if (err) {
    return [null, err];
  }

  // ✅ CRITICAL FIX FOR SAFARI ITP:
  // Store auth info in localStorage as backup for when JSESSIONID cookie is blocked
  if (data && data.id) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      id: data.id,
      email: data.email,
      role: data.role,
      name: data.name,
      timestamp: Date.now()
    }));
    console.log('Auth info stored in localStorage (Safari ITP fallback)');
  }

  // Test session with a request
  if (data && data.id) {
    try {
      const testRes = await request('GET', '/facilities');
      if (testRes.status === 401) {
        console.warn('Session cookie not persisted - using localStorage fallback');
      }
    } catch (e) {
      console.warn('Session verification failed (network issue):', e);
    }
  }

  return [data, null];
}

export async function logout() {
  try {
    await request('POST', '/auth/logout');
  } catch {}
  sessionStorage.removeItem('cbms_user');
  localStorage.removeItem(AUTH_STORAGE_KEY);  // Clear Safari ITP fallback
}
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
