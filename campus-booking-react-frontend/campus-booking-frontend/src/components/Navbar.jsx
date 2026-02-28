import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import {
  LayoutDashboard, Building2, CalendarDays, Users, User,
  LogOut, GraduationCap, ShieldCheck, Menu, X
} from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await signOut();
    toast('You have been signed out.', 'info');
    navigate('/login');
  }

  const links = [
    { to: isAdmin ? '/admin' : '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
    { to: '/facilities', label: 'Facilities', icon: <Building2 size={15} /> },
    { to: '/bookings', label: 'Bookings', icon: <CalendarDays size={15} /> },
    ...(isAdmin ? [{ to: '/users', label: 'Users', icon: <Users size={15} /> }] : []),
    { to: '/profile', label: 'Profile', icon: <User size={15} /> },
  ];

  function close() { setMenuOpen(false); }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/" className="navbar-brand">
          <GraduationCap size={20} color="var(--gold)" />
          <span>Campus<strong style={{ color: 'var(--gold)' }}>Book</strong></span>
        </a>

        <ul className="nav-links">
          {links.map(l => (
            <li key={l.to}>
              <NavLink to={l.to} className={({ isActive }) => isActive ? 'active' : ''}>
                {l.icon}{l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar-user">
          <span className="user-name">{user?.name || user?.email}</span>
          {isAdmin
            ? <span className="badge badge-admin"><ShieldCheck size={10} />Admin</span>
            : <span className="badge badge-user">Student</span>
          }
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Sign out">
            <LogOut size={14} />
          </button>
        </div>

        {/* Hamburger — visible on mobile only */}
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <div className="mobile-nav">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={close}
            >
              {l.icon}{l.label}
            </NavLink>
          ))}
          <div className="mobile-nav-divider" />
          <div className="mobile-nav-user">
            <div className="mobile-nav-user-info">
              <span className="user-name">{user?.name || user?.email}</span>
              <span className="user-role">{isAdmin ? 'Administrator' : 'Student / Staff'}</span>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => { close(); handleLogout(); }}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
