import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user, isAdmin } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      position: 'relative',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(194, 124, 14, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
        {/* 404 number */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(7rem, 20vw, 10rem)',
          fontWeight: 700,
          lineHeight: 1,
          color: 'var(--gold)',
          letterSpacing: '-0.04em',
          textShadow: '0 0 60px rgba(194, 124, 14, 0.25)',
          marginBottom: '0.5rem',
        }}>
          404
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.4rem, 4vw, 1.8rem)',
          fontWeight: 600,
          color: 'var(--cream)',
          marginBottom: '1rem',
        }}>
          Page Not Found
        </h1>

        {/* Message */}
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          lineHeight: 1.7,
          marginBottom: '2rem',
        }}>
          The page you're looking for doesn't exist or has been moved.
          Let's get you back to somewhere useful.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              className="btn btn-primary btn-lg"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
              <Link to="/login" className="btn btn-ghost btn-lg">Sign In</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
