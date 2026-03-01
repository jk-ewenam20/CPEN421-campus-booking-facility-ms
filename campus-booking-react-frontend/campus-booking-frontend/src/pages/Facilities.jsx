import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import {
  getAllFacilities, createFacility, updateFacility, deleteFacility,
  createBooking, checkAvailability
} from '../api/client';
import Modal from '../components/Modal';
import {
  Building2, MapPin, Users, Search, Plus, Edit3, Trash2,
  Loader2, LayoutGrid, List, CalendarDays, CheckCircle2
} from 'lucide-react';

// ─── Time slot config ────────────────────────────────────────────────────────
const START_SLOTS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00'];
const ALL_END_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'];

// ─── FacilityForm Component (Memoized) ──────────────────────────────────────
const FacilityFormComponent = memo(({ form, setField }) => (
  <>
    <div className="form-group">
      <label className="form-label">Facility Name</label>
      <input className="form-control" placeholder="e.g. Main Auditorium" value={form.name} onChange={setField('name')} />
    </div>
    <div className="form-group">
      <label className="form-label">Location</label>
      <input className="form-control" placeholder="e.g. Block A, Room 101" value={form.location} onChange={setField('location')} />
    </div>
    <div className="form-group">
      <label className="form-label">Capacity (persons)</label>
      <input className="form-control" type="number" min="1" placeholder="50" value={form.capacity} onChange={setField('capacity')} />
    </div>
  </>
));

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
  if (day === 6) d.setDate(d.getDate() + 2); // Sat → Mon
  if (day === 0) d.setDate(d.getDate() + 1); // Sun → Mon
  return d.toISOString().split('T')[0];
}

const today = new Date().toISOString().split('T')[0]; // for min= attribute
const emptyForm = { name: '', location: '', capacity: '' };

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

export default function Facilities() {
  const { isAdmin, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');

  // Admin CRUD modal
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Book Now modal
  const [bookModal, setBookModal] = useState(null);
  const [bookForm, setBookForm] = useState(makeEmptyBookForm());
  const [bookAvail, setBookAvail] = useState(null);
  const [bookSaving, setBookSaving] = useState(false);
  const [bookAvailTimer, setBookAvailTimer] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [data, err] = await getAllFacilities();
    if (err) toast(err, 'error');
    else setFacilities(data || []);
    setLoading(false);
  }

  function openCreate() { setForm(emptyForm); setSelected(null); setModal('create'); }
  function openEdit(f) {
    setForm({ name: f.name, location: f.location, capacity: String(f.capacity) });
    setSelected(f); setModal('edit');
  }
  function openDelete(f) { setSelected(f); setModal('delete'); }
  function closeModal() { setModal(null); setSelected(null); }

  function openBook(f) { setBookModal(f); setBookForm(makeEmptyBookForm()); setBookAvail(null); }
  function closeBook() { setBookModal(null); setBookAvail(null); }

  function setField(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }

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

  async function handleSave() {
    if (!form.name.trim() || !form.location.trim() || !form.capacity) {
      toast('All fields are required.', 'error'); return;
    }
    if (Number(form.capacity) < 1) {
      toast('Capacity must be at least 1.', 'error'); return;
    }
    setSaving(true);
    const payload = { name: form.name.trim(), location: form.location.trim(), capacity: Number(form.capacity) };
    const [data, err] = modal === 'create'
      ? await createFacility(payload)
      : await updateFacility(selected.id, payload);
    setSaving(false);
    if (err) { toast(err, 'error'); return; }
    if (modal === 'create') setFacilities(f => [...f, data]);
    else setFacilities(f => f.map(x => x.id === selected.id ? data : x));
    toast(modal === 'create' ? 'Facility created!' : 'Facility updated!', 'success');
    closeModal();
  }

  async function handleDelete() {
    setSaving(true);
    const [, err] = await deleteFacility(selected.id);
    setSaving(false);
    if (err) { toast(err, 'error'); return; }
    setFacilities(f => f.filter(x => x.id !== selected.id));
    toast('Facility deleted.', 'info');
    closeModal();
  }

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
    const [, err] = await createBooking(payload);
    setBookSaving(false);
    if (err) { toast(err, 'error'); return; }
    toast('Booking confirmed!', 'success');
    closeBook();
    navigate('/bookings');
  }

  const AvailBadge = ({ avail }) => {
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

  const filtered = facilities.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.location.toLowerCase().includes(search.toLowerCase())
  );


  const BookForm = () => (
    <>
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
      <AvailBadge avail={bookAvail} />
    </>
  );

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div className="page-title">
          <span>Campus Resources</span>
          <h1>Facilities</h1>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} /> Add Facility
          </button>
        )}
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={15} />
          <input
            className="form-control"
            placeholder="Search by name or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button className={`btn btn-sm ${view === 'grid' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setView('grid')}>
            <LayoutGrid size={14} />
          </button>
          <button className={`btn btn-sm ${view === 'list' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setView('list')}>
            <List size={14} />
          </button>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
          {filtered.length} facilit{filtered.length !== 1 ? 'ies' : 'y'}
        </span>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /><span>Loading facilities…</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Building2 size={48} />
          <h3>{search ? 'No matching facilities' : 'No facilities yet'}</h3>
          <p>{search ? 'Try a different search term' : isAdmin ? 'Add your first facility to get started' : 'Check back later'}</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-3">
          {filtered.map(f => (
            <div key={f.id} className="card facility-card">
              <div className="facility-card-header">
                <div>
                  <div className="facility-card-title">{f.name}</div>
                </div>
                <div style={{ background: 'var(--gold-dim)', padding: '0.35rem 0.6rem', borderRadius: '6px' }}>
                  <Building2 size={18} color="var(--gold)" />
                </div>
              </div>
              <div className="facility-card-meta">
                <span><MapPin size={13} />{f.location}</span>
                <span><Users size={13} />Capacity: {f.capacity} persons</span>
              </div>
              <div className="facility-card-footer">
                {isAdmin ? (
                  <>
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => openEdit(f)}>
                      <Edit3 size={13} /> Edit
                    </button>
                    <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => openDelete(f)}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </>
                ) : (
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => openBook(f)}>
                    <CalendarDays size={13} /> Book Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Location</th><th>Capacity</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => (
                <tr key={f.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td><strong>{f.name}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{f.location}</td>
                  <td>{f.capacity} persons</td>
                  <td>
                    <div className="td-actions">
                      {isAdmin ? (
                        <>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(f)}><Edit3 size={13} /> Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => openDelete(f)}><Trash2 size={13} /> Delete</button>
                        </>
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => openBook(f)}>
                          <CalendarDays size={13} /> Book Now
                        </button>
                      )}
                    </div>
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
        title={modal === 'create' ? 'Add New Facility' : 'Edit Facility'}
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={15} /> : null}
              {modal === 'create' ? 'Create Facility' : 'Save Changes'}
            </button>
          </>
        }
      >
        <FacilityFormComponent form={form} setField={setField} />
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={modal === 'delete'}
        title="Delete Facility"
        onClose={closeModal}
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
              {saving ? <Loader2 size={15} /> : <Trash2 size={14} />} Delete
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{selected?.name}</strong>?
          This action cannot be undone and will remove all associated bookings.
        </p>
      </Modal>

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
        <BookForm />
      </Modal>
    </div>
  );
}
