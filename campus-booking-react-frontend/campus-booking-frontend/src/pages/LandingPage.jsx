import { Link } from 'react-router-dom';
import { CalendarDays, Building2, ShieldCheck, Search, Clock, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-root">
      {/* ── Nav ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <span className="landing-brand">
            <span className="brand-dot" />
            CampusBook
          </span>
          <div className="landing-nav-actions">
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-glow" />
        <div className="landing-hero-content">
          <span className="landing-eyebrow">Campus Space Management</span>
          <h1 className="landing-hero-title">
            Reserve Campus Spaces,<br />Effortlessly.
          </h1>
          <p className="landing-hero-subtitle">
            Book lecture halls, labs, and meeting rooms in seconds.
            Real-time availability, instant confirmation — no back-and-forth emails.
          </p>
          <div className="landing-hero-ctas">
            <Link to="/register" className="btn btn-primary btn-lg">Get Started — It's Free</Link>
            <Link to="/login" className="btn btn-ghost btn-lg">Sign In</Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-features">
        <div className="landing-section-inner">
          <span className="landing-eyebrow" style={{ textAlign: 'center', display: 'block' }}>Why CampusBook</span>
          <h2 className="landing-section-title">Everything you need to manage spaces</h2>
          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <CalendarDays size={24} color="var(--gold)" />
              </div>
              <h3>Easy Booking</h3>
              <p>Pick a facility, choose your time slot, and confirm — all in under a minute.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <Building2 size={24} color="var(--gold)" />
              </div>
              <h3>Real-time Availability</h3>
              <p>Live availability checks as you type — no more double-bookings or scheduling conflicts.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <ShieldCheck size={24} color="var(--gold)" />
              </div>
              <h3>Role-Based Access</h3>
              <p>Admins manage all facilities and users. Students see and manage only their own bookings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="landing-how">
        <div className="landing-section-inner">
          <span className="landing-eyebrow" style={{ textAlign: 'center', display: 'block' }}>Simple Process</span>
          <h2 className="landing-section-title">Three steps to your reservation</h2>
          <div className="landing-steps">
            <div className="landing-step">
              <div className="landing-step-num">1</div>
              <Search size={20} color="var(--gold)" />
              <h3>Browse Facilities</h3>
              <p>Explore available spaces — filter by name or location to find the right fit.</p>
            </div>
            <div className="landing-step-divider" />
            <div className="landing-step">
              <div className="landing-step-num">2</div>
              <Clock size={20} color="var(--gold)" />
              <h3>Choose Your Time</h3>
              <p>Select a date and time slot. Availability updates live so you always book with confidence.</p>
            </div>
            <div className="landing-step-divider" />
            <div className="landing-step">
              <div className="landing-step-num">3</div>
              <CheckCircle2 size={20} color="var(--gold)" />
              <h3>Confirm &amp; Go</h3>
              <p>Hit Confirm Booking — your reservation is instant and you can manage it anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="landing-stats">
        <div className="landing-section-inner">
          <div className="landing-stats-grid">
            <div className="landing-stat">
              <span className="landing-stat-value">24/7</span>
              <span className="landing-stat-label">Access Anytime</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-value">Instant</span>
              <span className="landing-stat-label">Confirmation</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-value">Zero</span>
              <span className="landing-stat-label">Double-Bookings</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta">
        <div className="landing-section-inner" style={{ textAlign: 'center' }}>
          <h2>Ready to book your space?</h2>
          <p>Join your campus community on CampusBook today.</p>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ marginTop: '1.5rem' }}>
            Create an Account
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-nav-inner">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} CampusBook. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sign In</Link>
            <Link to="/register" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
