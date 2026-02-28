import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { getUser, updateUser, getAllBookings } from '../api/client';
import { format, parseISO, isFuture } from 'date-fns';
import { User, Mail, Lock, ShieldCheck, Loader2, CalendarDays, Building2, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const { user, signIn } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [[pData], [bData]] = await Promise.all([
      getUser(user.id),
      getAllBookings()
    ]);
    if (pData) {
      setProfile(pData);
      setForm({ name: pData.name || '', email: pData.email, password: '' });
    }
    const myBookings = (bData || []).filter(b =>
      b.userName === (pData?.name || user?.email) || b.userName === user?.email
    );
    setBookings(myBookings);
    setLoading(false);
  }

  function setField(f) { return e => setForm(prev => ({ ...prev, [f]: e.target.value })); }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.email) { toast('Email is required.', 'error'); return; }
    setSaving(true);
    const payload = { name: form.name, email: form.email, role: profile?.role || 'USER' };
    if (form.password) payload.password = form.password;
    const [data, err] = await updateUser(user.id, payload);
    setSaving(false);
    if (err) { toast(err, 'error'); return; }
    setProfile(data);
    // Update session with new info
    signIn({ ...user, name: data.name || data.email.split('@')[0], email: data.email });
    toast('Profile updated!', 'success');
    setForm(f => ({ ...f, password: '' }));
  }

  const upcoming = bookings.filter(b => b.status === 'CONFIRMED' && isFuture(parseISO(b.date)));
  const total = bookings.length;
  const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;

  if (loading) return (
    <div className="page-wrapper loading-page">
      <div className="spinner" /><span>Loading profile…</span>
    </div>
  );

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div className="page-title">
          <span>Account</span>
          <h1>My Profile</h1>
        </div>
      </div>

      {/* Profile header card */}
      <div className="profile-header-card">
        <div className="profile-header-avatar" style={{
          width: 72, height: 72, borderRadius: '50%',
          background: profile?.role === 'ADMIN' ? 'var(--gold-dim)' : 'var(--info-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${profile?.role === 'ADMIN' ? 'var(--gold)' : 'var(--info)'}`,
        }}>
          {profile?.role === 'ADMIN'
            ? <ShieldCheck size={30} color="var(--gold)" />
            : <User size={30} color="var(--info)" />
          }
        </div>
        <div className="profile-header-info">
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{profile?.name || profile?.email}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{profile?.email}</p>
          <span className={`badge ${profile?.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
            {profile?.role === 'ADMIN' ? 'Administrator' : 'Student / Staff'}
          </span>
        </div>
        <div className="profile-header-stats">
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700 }}>{total}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>{upcoming.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Upcoming</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
          Edit Profile
        </button>
        <button className={`tab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          Booking History ({total})
        </button>
      </div>

      {tab === 'profile' ? (
        <div style={{ maxWidth: 480 }}>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Your full name"
                  value={form.name}
                  onChange={setField('name')}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={form.email}
                  onChange={setField('email')}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                New Password <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontWeight: 400 }}>(optional — leave blank to keep current)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={setField('password')}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 size={15} /> : <CheckCircle2 size={15} />}
              Save Changes
            </button>
          </form>
        </div>
      ) : (
        <div>
          {bookings.length === 0 ? (
            <div className="empty-state">
              <CalendarDays size={48} />
              <h3>No bookings yet</h3>
              <p>Your booking history will appear here</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Facility</th>
                    <th>Date</th>
                    <th className="bookings-time-col">Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...bookings].sort((a, b) => b.id - a.id).map(b => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Building2 size={13} color="var(--gold)" />
                          <strong>{b.facilityName}</strong>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {format(parseISO(b.date), 'EEE, MMM d, yyyy')}
                      </td>
                      <td className="bookings-time-col" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {b.startTime?.slice(0, 5)} – {b.endTime?.slice(0, 5)}
                      </td>
                      <td>
                        <span className={`badge badge-${b.status?.toLowerCase()}`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
