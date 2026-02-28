import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllBookings, getAllFacilities, getAllUsers, cancelBooking } from '../api/client';
import { useToast } from '../hooks/useToast';
import Modal from '../components/Modal';
import { format, parseISO, isToday } from 'date-fns';
import {
  CalendarDays, Building2, Users, XCircle,
  Clock, ArrowRight, TrendingUp
} from 'lucide-react';

export default function AdminDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState({ bookings: [], facilities: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    async function load() {
      const [[b], [f], [u]] = await Promise.all([getAllBookings(), getAllFacilities(), getAllUsers()]);
      setStats({ bookings: b || [], facilities: f || [], users: u || [] });
      setLoading(false);
    }
    load();
  }, []);

  async function confirmCancel() {
    const [, err] = await cancelBooking(cancelTarget.id);
    if (err) { toast(err, 'error'); setCancelTarget(null); return; }
    setStats(s => ({
      ...s,
      bookings: s.bookings.map(b => b.id === cancelTarget.id ? { ...b, status: 'CANCELLED' } : b)
    }));
    toast('Booking cancelled.', 'info');
    setCancelTarget(null);
  }

  const { bookings, facilities, users } = stats;
  const confirmed = bookings.filter(b => b.status === 'CONFIRMED');
  const cancelled = bookings.filter(b => b.status === 'CANCELLED');
  const todayCount = bookings.filter(b => isToday(parseISO(b.date))).length;
  const recent = [...bookings].sort((a, b) => b.id - a.id).slice(0, 8);

  // Facility utilization — top 5 most booked
  const facilityMap = {};
  bookings.forEach(b => {
    facilityMap[b.facilityName] = (facilityMap[b.facilityName] || 0) + 1;
  });
  const topFacilities = Object.entries(facilityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (loading) return (
    <div className="page-wrapper loading-page">
      <div className="spinner" /><span>Loading admin dashboard…</span>
    </div>
  );

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div className="page-title">
          <span>Admin Dashboard</span>
          <h1>System Overview</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card gold">
          <CalendarDays size={32} className="stat-icon" />
          <div className="stat-number">{bookings.length}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card green">
          <Building2 size={32} className="stat-icon" />
          <div className="stat-number">{facilities.length}</div>
          <div className="stat-label">Facilities</div>
        </div>
        <div className="stat-card blue">
          <Users size={32} className="stat-icon" />
          <div className="stat-number">{users.length}</div>
          <div className="stat-label">Registered Users</div>
        </div>
        <div className="stat-card red">
          <Clock size={32} className="stat-icon" />
          <div className="stat-number">{todayCount}</div>
          <div className="stat-label">Today's Bookings</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '1.5rem' }}>
        {/* Recent bookings table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>Recent Bookings</h2>
            <Link to="/bookings" className="btn btn-ghost btn-sm">View all <ArrowRight size={13} /></Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No bookings yet</td></tr>
                ) : recent.map(b => (
                  <tr key={b.id}>
                    <td>{b.facilityName}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{b.userName}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {format(parseISO(b.date), 'MMM d')}
                    </td>
                    <td>
                      <span className={`badge badge-${b.status?.toLowerCase()}`}>{b.status}</span>
                    </td>
                    <td>
                      {b.status === 'CONFIRMED' && (
                        <button className="btn btn-danger btn-sm" onClick={() => setCancelTarget(b)}>
                          <XCircle size={13} />Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Booking breakdown */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Booking Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Confirmed', count: confirmed.length, color: 'var(--success)', total: bookings.length },
                { label: 'Cancelled', count: cancelled.length, color: 'var(--danger)', total: bookings.length },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontWeight: 600 }}>{item.count}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--navy)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${item.total ? (item.count / item.total) * 100 : 0}%`,
                      background: item.color,
                      borderRadius: '3px',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top facilities */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TrendingUp size={16} color="var(--gold)" />
              <h3 style={{ fontSize: '1rem' }}>Most Booked Facilities</h3>
            </div>
            {topFacilities.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {topFacilities.map(([name, count], i) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <span style={{ width: '20px', color: 'var(--text-muted)', fontWeight: 600 }}>#{i + 1}</span>
                    <span style={{ flex: 1 }}>{name}</span>
                    <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{count} bookings</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/facilities" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Building2 size={15} /> Manage Facilities
              </Link>
              <Link to="/users" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Users size={15} /> Manage Users
              </Link>
              <Link to="/bookings" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <CalendarDays size={15} /> All Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel confirmation modal */}
      <Modal
        open={!!cancelTarget}
        title="Cancel Booking"
        onClose={() => setCancelTarget(null)}
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setCancelTarget(null)}>Keep Booking</button>
            <button className="btn btn-danger" onClick={confirmCancel}>
              <XCircle size={14} /> Yes, Cancel
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Cancel the booking for{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{cancelTarget?.facilityName}</strong>
          {cancelTarget?.userName ? <> by <strong style={{ color: 'var(--text-primary)' }}>{cancelTarget.userName}</strong></> : null}?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
