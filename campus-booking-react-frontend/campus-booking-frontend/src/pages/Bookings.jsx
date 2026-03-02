import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import {
  getAllBookings, getAllFacilities, createBooking, updateBooking,
  cancelBooking, checkAvailability
} from '../api/client';
import Modal from '../components/Modal';
import { format, parseISO, isFuture } from 'date-fns';
import {
  CalendarDays, Clock, Search, Plus, Edit3, XCircle,
  CheckCircle2, Loader2, Building2
} from 'lucide-react';

// ─── Time slot config ────────────────────────────────────────────────────────
const START_SLOTS = [
  '07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00'
];
const ALL_END_SLOTS = [
  '07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'
];

function endSlotsFor(start) {
  if (!start) return ALL_END_SLOTS;
  return ALL_END_SLOTS.filter(t => t > start);
}

function fmtSlot(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
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

function makeEmptyForm(facilityId = '') {
  const date = nextWeekday();
  const nowH = date === today ? new Date().getHours() : -1;
  const startTime = START_SLOTS.find(t => parseInt(t, 10) > nowH) || '09:00';
  const endTime = endSlotsFor(startTime)[0] || '10:30';
  return { facilityId, date, startTime, endTime };
}

function toApiTime(t) { return t && t.length === 5 ? t + ':00' : t; }
function fmtTime(t) { return t ? String(t).slice(0, 5) : ''; }

export default function Bookings() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(makeEmptyForm());
  const [saving, setSaving] = useState(false);

  const [avail, setAvail] = useState(null);
  const [availTimer, setAvailTimer] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [[bData], [fData]] = await Promise.all([getAllBookings(), getAllFacilities()]);
    setBookings(bData || []);
    setFacilities(fData || []);
    setLoading(false);
  }

  function openCreate() { setForm(makeEmptyForm()); setSelected(null); setAvail(null); setModal('create'); }

  function openEdit(b) {
    const facility = facilities.find(f => f.name === b.facilityName);
    const start = fmtTime(b.startTime);
    const end = fmtTime(b.endTime);
    setForm({
      facilityId: String(facility?.id || ''),
      date: b.date,
      startTime: START_SLOTS.includes(start) ? start : START_SLOTS[0],
      endTime: ALL_END_SLOTS.includes(end) ? end : ALL_END_SLOTS[0],
    });
    setSelected(b);
    setAvail(null);
    setModal('edit');
  }

  function closeModal() { setModal(null); setSelected(null); setAvail(null); }

  function setField(field) {
    return e => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      setAvail(null);
    };
  }

  function handleStartSlot(t) {
    setForm(prev => {
      const endTime = prev.endTime > t ? prev.endTime : (endSlotsFor(t)[0] || prev.endTime);
      return { ...prev, startTime: t, endTime };
    });
    setAvail(null);
  }

  function handleEndSlot(t) {
    setForm(prev => ({ ...prev, endTime: t }));
    setAvail(null);
  }

  function handleDateChange(e) {
    const val = e.target.value;
    if (val && !isWeekday(val)) {
      toast('Please select a weekday (Mon – Fri).', 'error');
      setForm(prev => ({ ...prev, date: '' }));
      return;
    }
    setForm(prev => {
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
    setAvail(null);
  }

  const triggerAvailCheck = useCallback((f) => {
    if (!f.facilityId || !f.date || !f.startTime || !f.endTime) return;
    if (availTimer) clearTimeout(availTimer);
    setAvail('checking');
    const timer = setTimeout(async () => {
      const [data, err] = await checkAvailability(
        f.facilityId, f.date, toApiTime(f.startTime), toApiTime(f.endTime)
      );
      if (!err && data !== null) setAvail(data);
      else setAvail(null);
    }, 600);
    setAvailTimer(timer);
  }, [availTimer]);

  useEffect(() => {
    if (modal === 'create' || modal === 'edit') triggerAvailCheck(form);
  }, [form.facilityId, form.date, form.startTime, form.endTime]);

  async function handleSave() {
    if (!form.facilityId || !form.date || !form.startTime || !form.endTime) {
      toast('Please fill in all fields.', 'error');
      return;
    }
    if (!isWeekday(form.date)) {
      toast('Bookings are only allowed Mon – Fri.', 'error');
      return;
    }
    if (form.startTime >= form.endTime) {
      toast('End time must be after start time.', 'error');
      return;
    }
    if (avail === false) {
      toast('This facility is not available for the selected time slot.', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      facilityId: Number(form.facilityId),
      userId: user.id,
      date: form.date,
      startTime: toApiTime(form.startTime),
      endTime: toApiTime(form.endTime),
    };
    const [data, err] = modal === 'create'
      ? await createBooking(payload)
      : await updateBooking(selected.id, payload);
    setSaving(false);
    if (err) {
      toast(err, 'error');
      return;
    }
    if (modal === 'create') await load();
    else setBookings(prev => prev.map(b => b.id === selected.id ? data : b));
    toast(modal === 'create' ? 'Booking confirmed!' : 'Booking updated!', 'success');
    closeModal();
  }

  async function confirmCancel() {
    const [, err] = await cancelBooking(cancelTarget.id);
    if (err) {
      toast(err, 'error');
      setCancelTarget(null);
      return;
    }
    setBookings(prev => prev.map(b => b.id === cancelTarget.id ? { ...b, status: 'CANCELLED' } : b));
    toast('Booking cancelled.', 'info');
    setCancelTarget(null);
  }

  const tabFiltered = bookings.filter(b => {
    if (activeTab === 'upcoming') return b.status === 'CONFIRMED' && isFuture(parseISO(b.date));
    if (activeTab === 'cancelled') return b.status === 'CANCELLED';
    return true;
  });

  const displayed = tabFiltered.filter(b => {
    const q = search.toLowerCase();
    return !q ||
      b.facilityName?.toLowerCase().includes(q) ||
      b.userName?.toLowerCase().includes(q) ||
      b.date?.includes(q);
  });

  const AvailBadge = () => {
    if (avail === null) return null;
    if (avail === 'checking') return (
      <div className="availability-indicator">
        <div className="avail-dot checking" />
        <span style={{ color: 'var(--warning)', fontSize: '0.8rem' }}>Checking availability…</span>
      </div>
    );
    if (avail === true) return (
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

  if (loading) return (
    <div className="page-wrapper loading-page">
      <div className="spinner" /><span>Loading bookings…</span>
    </div>
  );

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div className="page-title">
          <span>Facility Bookings</span>
          <h1>My Reservations</h1>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> New Booking
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={15} />
          <input
            className="form-control"
            placeholder="Search bookings…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
          </button>
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="empty-state">
          <CalendarDays size={48} />
          <h3>No bookings found</h3>
          <p>{search ? 'Try a different search term' : 'Create your first booking'}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {isAdmin && <th>User</th>}
                <th>Facility</th>
                <th>Date</th>
                <th className="bookings-time-col">Time</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(b => (
                <tr key={b.id}>
                  {isAdmin && <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{b.userName}</td>}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
                      <Building2 size={13} color="var(--gold)" />
                      {b.facilityName}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
                      <CalendarDays size={13} color="var(--text-muted)" />
                      {format(parseISO(b.date), 'EEE, MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="bookings-time-col">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <Clock size={13} />
                      {fmtSlot(fmtTime(b.startTime))} – {fmtSlot(fmtTime(b.endTime))}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${b.status?.toLowerCase()}`}>{b.status}</span>
                  </td>
                  <td>
                    {(isAdmin || b.userId === user?.id) && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {b.status === 'CONFIRMED' && (
                          <>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>
                              <Edit3 size={13} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => setCancelTarget(b)}>
                              <XCircle size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modal === 'create' || modal === 'edit'}
        title={modal === 'create' ? 'New Booking' : 'Edit Booking'}
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={15} /> : <CheckCircle2 size={15} />}
              {modal === 'create' ? 'Create Booking' : 'Save Changes'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Facility</label>
          <select className="form-control" value={form.facilityId} onChange={setField('facilityId')}>
            <option value="">Select a facility</option>
            {facilities.map(f => (
              <option key={f.id} value={f.id}>{f.name} - {f.location}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date (Mon – Fri only)</label>
          <input type="date" className="form-control" value={form.date} min={today} onChange={handleDateChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Start Time</label>
          <div className="slot-grid">
            {START_SLOTS.map(t => (
              <button type="button" key={t}
                className={`slot-btn${form.startTime === t ? ' selected' : ''}`}
                onClick={() => handleStartSlot(t)}
                disabled={isPastSlot(t, form.date)}
              >{fmtSlot(t)}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">End Time</label>
          <div className="slot-grid">
            {endSlotsFor(form.startTime).map(t => (
              <button type="button" key={t}
                className={`slot-btn${form.endTime === t ? ' selected' : ''}`}
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
          Are you sure you want to cancel the booking for{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{cancelTarget?.facilityName}</strong>
          {' '}on {cancelTarget?.date}?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
