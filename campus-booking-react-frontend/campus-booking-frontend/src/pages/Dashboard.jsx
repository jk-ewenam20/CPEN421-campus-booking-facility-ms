import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import {
  getAllBookings, getAllFacilities, cancelBooking,
  createBooking, checkAvailability
} from '../api/client';
import Modal from '../components/Modal';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import {
  CalendarDays, Building2, Clock, CheckCircle2, XCircle,
  Plus, ArrowRight, MapPin, Users, Loader2
} from 'lucide-react';

// ─── Time slot config ────────────────────────────────────────────────────────
const START_SLOTS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00'];
const ALL_END_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'];

function endSlotsFor(start) {
  if (!start) return ALL_END_SLOTS;
  return ALL_END_SLOTS.filter(t => t > start);
}

function fmtSlot(t) {
  const h = parseInt(t, 10);
  if (h === 12) return '12:00 PM';
  return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
}

function isWeekday(dateStr) {
  if (!dateStr) return true;
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  return day >= 1 && day <= 5;
}

function nextWeekday() {
  const d = new Date();
  const day = d.getDay();
  if (day === 6) d.setDate(d.getDate() + 2);
  if (day === 0) d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

const today = new Date().toISOString().split('T')[0];

function isPastSlot(timeStr, dateStr) {
  if (!dateStr || dateStr !== today) return false;
  return parseInt(timeStr, 10) <= new Date().getHours();
}

function makeEmptyBookForm() {
  const date = nextWeekday();
  const nowH = date === today ? new Date().getHours() : -1;
  const startTime = START_SLOTS.find(t => parseInt(t, 10) > nowH) || '09:00';
  const endTime = endSlotsFor(startTime)[0] || '10:00';
  return { date, startTime, endTime };
}

function toApiTime(t) { return t && t.length === 5 ? t + ':00' : t; }

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null); // booking to cancel

  // Book Now modal state
  const [bookModal, setBookModal] = useState(null); // null | facilityDTO
  const [bookForm, setBookForm] = useState(makeEmptyBookForm());
  const [bookAvail, setBookAvail] = useState(null); // null | 'checking' | true | false
  const [bookSaving, setBookSaving] = useState(false);
  const [bookAvailTimer, setBookAvailTimer] = useState(null);

  const load = useCallback(async () => {
    const [[bData], [fData]] = await Promise.all([getAllBookings(), getAllFacilities()]);
    // Filter to current user's bookings by ID (robust — doesn't depend on name format)
    const myBookings = (bData || []).filter(b => b.userId === user?.id);
    setBookings(myBookings);
    setFacilities((fData || []).slice(0, 6));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function confirmCancel() {
    const [, err] = await cancelBooking(cancelTarget.id);
    if (err) { toast(err, 'error'); setCancelTarget(null); return; }
    setBookings(prev => prev.map(b => b.id === cancelTarget.id ? { ...b, status: 'CANCELLED' } : b));
    toast('Booking cancelled.', 'info');
    setCancelTarget(null);
  }

  function openBook(f) {
    setBookModal(f);
    setBookForm(makeEmptyBookForm());
    setBookAvail(null);
  }
  function closeBook() { setBookModal(null); setBookAvail(null); }

  function handleStartSlot(t) {
    setBookForm(prev => {
      const endTime = prev.endTime > t ? prev.endTime : (endSlotsFor(t)[0] || prev.endTime);
      return { ...prev, startTime: t, endTime };
    });
    setBookAvail(null);
  }

  function handleEndSlot(t) {
    setBookForm(prev => ({ ...prev, endTime: t }));
    setBookAvail(null);
  }

  function handleDateChange(e) {
    const val = e.target.value;
    if (val && !isWeekday(val)) {
      toast('Please select a weekday (Mon – Fri).', 'error');
      setBookForm(prev => ({ ...prev, date: '' }));
      return;
    }
    setBookForm(prev => {
      const updated = { ...prev, date: val };
      if (val === today) {
        const nowH = new Date().getHours();
        if (parseInt(prev.startTime, 10) <= nowH) {
          const validStart = START_SLOTS.find(t => parseInt(t, 10) > nowH);
          if (validStart) {
            updated.startTime = validStart;
            updated.endTime = endSlotsFor(validStart)[0] || prev.endTime;
          }
        }
      }
      return updated;
    });
    setBookAvail(null);
  }

  const triggerBookAvailCheck = useCallback((facility, f) => {
    if (!facility || !f.date || !f.startTime || !f.endTime) return;
    if (bookAvailTimer) clearTimeout(bookAvailTimer);
    setBookAvail('checking');
    const timer = setTimeout(async () => {
      const [data, err] = await checkAvailability(
        facility.id, f.date, toApiTime(f.startTime), toApiTime(f.endTime)
      );
      if (!err && data !== null) setBookAvail(data);
      else setBookAvail(null);
    }, 600);
    setBookAvailTimer(timer);
  }, [bookAvailTimer]);

  useEffect(() => {
    if (bookModal) triggerBookAvailCheck(bookModal, bookForm);
  }, [bookForm.date, bookForm.startTime, bookForm.endTime]);

  async function handleBookSave() {
    if (!bookForm.date) { toast('Please select a date.', 'error'); return; }
    if (!isWeekday(bookForm.date)) { toast('Bookings are only allowed Mon – Fri.', 'error'); return; }
    if (bookForm.startTime >= bookForm.endTime) {
      toast('End time must be after start time.', 'error'); return;
    }
    if (bookAvail === false) {
      toast('This facility is not available for the selected time slot.', 'error'); return;
    }
    setBookSaving(true);
    const payload = {
      facilityId: bookModal.id,
      userId: user.id,
      date: bookForm.date,
      startTime: toApiTime(bookForm.startTime),
      endTime: toApiTime(bookForm.endTime),
    };
    const [newBooking, err] = await createBooking(payload);
    setBookSaving(false);
    if (err) { toast(err, 'error'); return; }
    toast('Booking confirmed!', 'success');
    closeBook();
    // Add the new booking to state immediately so dashboard updates without full reload
    if (newBooking) setBookings(prev => [...prev, newBooking]);
  }

  const AvailBadge = () => {
    if (bookAvail === null) return null;
    if (bookAvail === 'checking') return (
      <div className="availability-indicator">
        <div className="avail-dot checking" />
        <span style={{ color: 'var(--warning)', fontSize: '0.8rem' }}>Checking availability…</span>
      </div>
    );
    if (bookAvail === true) return (
      <div className="availability-indicator">
        <div className="avail-dot green" />
        <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>Available for this time slot</span>
      </div>
    );
    return (
      <div className="availability-indicator">
        <div className="avail-dot red" />
        <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>Not available — time slot is taken</span>
      </div>
    );
  };

  const upcoming = bookings.filter(b => b.status === 'CONFIRMED' && isFuture(parseISO(b.date)));
  const todayBookings = bookings.filter(b => isToday(parseISO(b.date)) && b.status === 'CONFIRMED');
  const confirmed = bookings.filter(b => b.status === 'CONFIRMED');
  const cancelled = bookings.filter(b => b.status === 'CANCELLED');

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <div className="page-wrapper loading-page">
      <div className="spinner" /><span>Loading your dashboard…</span>
    </div>
  );

  return (
    <div className="page-wrapper page-enter">
      {/* Welcome banner */}
      <div className="welcome-banner">
        <div>
          <h2>{greeting()}, {user?.name || 'there'}!</h2>
          <p>Here's a summary of your campus bookings for today and upcoming days.</p>
        </div>
        <Link to="/bookings" className="btn btn-primary">
          <Plus size={15} />New Booking
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card gold">
          <Building2 size={32} className="stat-icon" />
          <div className="stat-number">{facilities.length}</div>
          <div className="stat-label">Available Facilities</div>
        </div>
        <div className="stat-card blue">
          <CalendarDays size={32} className="stat-icon" />
          <div className="stat-number">{upcoming.length}</div>
          <div className="stat-label">Upcoming Bookings</div>
        </div>
        <div className="stat-card green">
          <CheckCircle2 size={32} className="stat-icon" />
          <div className="stat-number">{todayBookings.length}</div>
          <div className="stat-label">Today's Bookings</div>
        </div>
        <div className="stat-card red">
          <XCircle size={32} className="stat-icon" />
          <div className="stat-number">{cancelled.length}</div>
          <div className="stat-label">Cancelled</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '1.5rem' }}>
        {/* Upcoming bookings */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>Upcoming Bookings</h2>
            <Link to="/bookings" className="btn btn-ghost btn-sm">View all <ArrowRight size={13} /></Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="card empty-state">
              <CalendarDays size={36} />
              <h3>No upcoming bookings</h3>
              <p>Reserve a facility to get started</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcoming.slice(0, 5).map(b => (
                <div key={b.id} className="card" style={{ padding: '1rem 1.25rem' }}>
                  <div className="booking-card-inner">
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '0.3rem' }}>{b.facilityName}</div>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CalendarDays size={12} />{format(parseISO(b.date), 'MMM d, yyyy')}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={12} />{fmtSlot(b.startTime?.slice(0, 5))} – {fmtSlot(b.endTime?.slice(0, 5))}
                        </span>
                      </div>
                    </div>
                    <div className="booking-card-actions">
                      <span className={`badge badge-${b.status?.toLowerCase()}`}>{b.status}</span>
                      <button className="btn btn-danger btn-sm" onClick={() => setCancelTarget(b)}>Cancel</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick access facilities */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>Available Facilities</h2>
            <Link to="/facilities" className="btn btn-ghost btn-sm">Browse all <ArrowRight size={13} /></Link>
          </div>

          {facilities.length === 0 ? (
            <div className="card empty-state">
              <Building2 size={36} />
              <h3>No facilities yet</h3>
              <p>Check back later</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {facilities.map(f => (
                <div key={f.id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{f.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {f.location} · Capacity {f.capacity}
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => openBook(f)}>
                    <CalendarDays size={13} /> Book
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Book Now Modal */}
      <Modal
        open={!!bookModal}
        title="Book Facility"
        onClose={closeBook}
        footer={
          <>
            <button className="btn btn-ghost" onClick={closeBook}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleBookSave}
              disabled={bookSaving || bookAvail === false}
            >
              {bookSaving ? <Loader2 size={15} /> : <CheckCircle2 size={15} />}
              Confirm Booking
            </button>
          </>
        }
      >
        {bookModal && (
          <div className="book-facility-info">
            <span className="book-facility-info-name">{bookModal.name}</span>
            <div className="book-facility-info-meta">
              <span><MapPin size={12} />{bookModal.location}</span>
              <span><Users size={12} />Capacity: {bookModal.capacity}</span>
            </div>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">
            Date{' '}
            <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              Mon – Fri only
            </span>
          </label>
          <input type="date" className="form-control" value={bookForm.date} min={today} onChange={handleDateChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Start Time</label>
          <div className="slot-grid">
            {START_SLOTS.map(t => (
              <button type="button" key={t}
                className={`slot-btn${bookForm.startTime === t ? ' selected' : ''}`}
                onClick={() => handleStartSlot(t)}
                disabled={isPastSlot(t, bookForm.date)}
              >{fmtSlot(t)}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">End Time</label>
          <div className="slot-grid">
            {endSlotsFor(bookForm.startTime).map(t => (
              <button type="button" key={t}
                className={`slot-btn${bookForm.endTime === t ? ' selected' : ''}`}
                onClick={() => handleEndSlot(t)}
              >{fmtSlot(t)}</button>
            ))}
          </div>
        </div>
        <AvailBadge />
      </Modal>

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
          Are you sure you want to cancel your reservation for{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{cancelTarget?.facilityName}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
