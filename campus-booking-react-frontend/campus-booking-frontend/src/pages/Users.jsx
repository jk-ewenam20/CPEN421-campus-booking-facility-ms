import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { getAllUsers, updateUser, deleteUser } from '../api/client';
import Modal from '../components/Modal';
import { Search, Edit3, Trash2, Loader2, ShieldCheck, User, Users } from 'lucide-react';

export default function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [data, err] = await getAllUsers();
    if (err) toast(err, 'error');
    else setUsers(data || []);
    setLoading(false);
  }

  function openEdit(u) {
    setSelected(u);
    setForm({ name: u.name || '', email: u.email, password: '', role: u.role });
    setModal('edit');
  }

  function openDelete(u) { setSelected(u); setModal('delete'); }
  function closeModal() { setModal(null); setSelected(null); }
  function setField(f) { return e => setForm(prev => ({ ...prev, [f]: e.target.value })); }

  async function handleSave() {
    if (!form.email.trim()) { toast('Email is required.', 'error'); return; }
    setSaving(true);
    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
      ...(form.password ? { password: form.password } : {})
    };
    const [data, err] = await updateUser(selected.id, payload);
    setSaving(false);
    if (err) { toast(err, 'error'); return; }
    setUsers(prev => prev.map(u => u.id === selected.id ? data : u));
    toast('User updated!', 'success');
    closeModal();
  }

  async function handleDelete() {
    setSaving(true);
    const [, err] = await deleteUser(selected.id);
    setSaving(false);
    if (err) { toast(err, 'error'); return; }
    setUsers(prev => prev.filter(u => u.id !== selected.id));
    toast('User deleted.', 'info');
    closeModal();
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || u.email?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q);
  });

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div className="page-title">
          <span>Administration</span>
          <h1>User Management</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {users.length} user{users.length !== 1 ? 's' : ''} registered
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={15} />
          <input
            className="form-control"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card blue" style={{ padding: '1rem 1.25rem' }}>
          <div className="stat-number" style={{ fontSize: '1.8rem' }}>{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card gold" style={{ padding: '1rem 1.25rem' }}>
          <div className="stat-number" style={{ fontSize: '1.8rem' }}>{users.filter(u => u.role === 'ADMIN').length}</div>
          <div className="stat-label">Administrators</div>
        </div>
        <div className="stat-card green" style={{ padding: '1rem 1.25rem' }}>
          <div className="stat-number" style={{ fontSize: '1.8rem' }}>{users.filter(u => u.role === 'USER').length}</div>
          <div className="stat-label">Students / Staff</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /><span>Loading users…</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>No users found</h3>
          <p>{search ? 'Try a different search term' : 'No users registered yet'}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: u.role === 'ADMIN' ? 'var(--gold-dim)' : 'var(--info-dim)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {u.role === 'ADMIN'
                          ? <ShieldCheck size={15} color="var(--gold)" />
                          : <User size={15} color="var(--info)" />
                        }
                      </div>
                      <span>{u.name || '—'}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                      {u.role === 'ADMIN' ? 'Admin' : 'Student'}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>
                        <Edit3 size={13} /> Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => openDelete(u)}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      <Modal
        open={modal === 'edit'}
        title="Edit User"
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={15} /> : null}Save Changes
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-control" placeholder="Jane Doe" value={form.name} onChange={setField('name')} />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-control" value={form.email} onChange={setField('email')} />
        </div>
        <div className="form-group">
          <label className="form-label">New Password <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontWeight: 400 }}>(leave blank to keep current)</span></label>
          <input type="password" className="form-control" placeholder="••••••••" value={form.password} onChange={setField('password')} />
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="form-control" value={form.role} onChange={setField('role')}>
            <option value="USER">Student / Staff</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={modal === 'delete'}
        title="Delete User"
        onClose={closeModal}
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
              {saving ? <Loader2 size={15} /> : <Trash2 size={14} />}Delete
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{selected?.email}</strong>?
          This will also remove all their bookings.
        </p>
      </Modal>
    </div>
  );
}
