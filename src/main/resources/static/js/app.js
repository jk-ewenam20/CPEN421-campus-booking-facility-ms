// ── Auth helpers ──────────────────────────────────────────────────────────────
const Auth = {
  get()        { try { return JSON.parse(sessionStorage.getItem('fbms_user') || 'null'); } catch { return null; } },
  set(u)       { sessionStorage.setItem('fbms_user', JSON.stringify(u)); },
  clear()      { sessionStorage.removeItem('fbms_user'); },
  isAdmin()    { return this.get()?.role === 'ADMIN'; },
  require(adminOnly = false) {
    const u = this.get();
    if (!u) { window.location.href = '/login.html'; return null; }
    if (adminOnly && u.role !== 'ADMIN') { window.location.href = '/dashboard.html'; return null; }
    return u;
  }
};

// ── API wrapper ───────────────────────────────────────────────────────────────
const API = {
  async req(method, path, body) {
    try {
      const opts = { method, credentials: 'include' };
      if (body !== undefined) {
        opts.headers = { 'Content-Type': 'application/json' };
        opts.body = JSON.stringify(body);
      }
      const res = await fetch(path, opts);
      if (res.status === 401) { Auth.clear(); window.location.href = '/login.html'; return null; }
      return res;
    } catch {
      toast('Network error. Please try again.', 'error');
      return null;
    }
  },
  get: (p)    => API.req('GET', p),
  post: (p,b) => API.req('POST', p, b),
  put: (p,b)  => API.req('PUT', p, b),
  del: (p)    => API.req('DELETE', p)
};

// ── Utilities ─────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// Parse an error response that may be plain text or JSON
async function parseError(res) {
  const text = await res.text().catch(() => '');
  try {
    const j = JSON.parse(text);
    return j.message || j.error || text;
  } catch {
    return text || `Request failed (${res.status})`;
  }
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtTime(t)  { return t ? String(t).slice(0, 5) : ''; }   // "09:00:00" → "09:00"
function toApiTime(t){ return t && t.length === 5 ? t + ':00' : t; }  // "09:00" → "09:00:00"

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ── Navbar ────────────────────────────────────────────────────────────────────
function initNav(active) {
  const user = Auth.require();
  if (!user) return null;
  const nav = document.getElementById('nav');
  if (!nav) return user;

  const home = user.role === 'ADMIN' ? '/admin-dashboard.html' : '/dashboard.html';
  const homeId = user.role === 'ADMIN' ? 'admin-dashboard' : 'dashboard';

  const pages = [
    { id: homeId,       href: home,               label: 'Dashboard'  },
    { id: 'facilities', href: '/facilities.html', label: 'Facilities' },
    { id: 'bookings',   href: '/bookings.html',   label: 'Bookings'   },
    ...(user.role === 'ADMIN' ? [{ id: 'users', href: '/users.html', label: 'Users' }] : []),
    { id: 'profile',    href: '/profile.html',    label: 'Profile'    },
  ];

  nav.innerHTML = `
    <a class="nav-brand" href="/dashboard.html">Facility Booking</a>
    <ul class="nav-links">
      ${pages.map(p => `<li><a href="${p.href}"${p.id === active ? ' class="active"' : ''}>${p.label}</a></li>`).join('')}
    </ul>
    <div class="nav-user">
      <span>${esc(user.name)}</span>
      <span class="badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}">${user.role}</span>
      <button class="btn btn-sm btn-outline" onclick="doLogout()">Logout</button>
    </div>`;
  return user;
}

async function doLogout() {
  await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
  Auth.clear();
  window.location.href = '/login.html';
}
