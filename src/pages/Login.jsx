import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, getRoleHomePath } from '../context/AuthContext';

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Already logged in
  if (isAuthenticated && user) {
    navigate(getRoleHomePath(user.role), { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const u = await login(email, password);
      navigate(getRoleHomePath(u.role), { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Brand panel */}
      <div style={{
        width: 440,
        flexShrink: 0,
        background: 'var(--sidebar-bg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative rings */}
        <div style={{
          position: 'absolute',
          bottom: -80,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: '50%',
          border: '1px solid oklch(40% 0.06 155)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: '50%',
          border: '1px solid oklch(38% 0.07 155)',
        }} />

        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, color: 'oklch(92% 0.02 90)', letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: 8 }}>
            Voices
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'oklch(65% 0.05 90)' }}>
            Education Concierge
          </div>
        </div>

        <div>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 500, color: 'oklch(88% 0.03 90)', lineHeight: 1.4, marginBottom: 24 }}>
            "Exceptional care for exceptional students."
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['Logistics', 'Accommodation', 'Medical', 'Academic'].map(tag => (
              <span key={tag} style={{
                padding: '4px 12px',
                borderRadius: 20,
                border: '1px solid oklch(38% 0.07 155)',
                fontSize: '0.75rem',
                color: 'oklch(72% 0.04 90)',
                letterSpacing: '0.04em',
              }}>{tag}</span>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'oklch(55% 0.03 155)' }}>
          © 2026 Voices Education Group
        </div>
      </div>

      {/* Form panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--content-bg)',
        padding: '48px 32px',
      }}>
        <div style={{ width: '100%', maxWidth: 380, animation: 'fadeSlideIn 0.4s both' }}>
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Sign in</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Access the Voices concierge dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@organization.com"
                autoComplete="email"
                className={error && !email ? 'error' : ''}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                  className={error && !password ? 'error' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: 0,
                    display: 'flex',
                  }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'var(--status-urgent-bg)',
                border: '1px solid var(--status-urgent-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--status-urgent)',
                fontSize: '0.85rem',
                marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: 4 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <p style={{ marginTop: 16, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Link to="/forgot-password" style={{ color: 'var(--accent-text)', textDecoration: 'none', fontWeight: 500 }}>
              Forgot your password?
            </Link>
          </p>

          <p style={{ marginTop: 8, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Need a sales account?{' '}
            <Link to="/signup" style={{ color: 'var(--accent-text)', textDecoration: 'none', fontWeight: 500 }}>
              Create one
            </Link>
          </p>

          <div style={{ marginTop: 16, padding: 20, background: 'var(--surface-raised)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Demo accounts</strong>
            <div style={{ display: 'grid', gap: 4 }}>
              {[
                ['Sales', 'sales@voices.edu'],
                ['Admin', 'admin@voices.edu'],
                ['Super Admin', 'superadmin@voices.edu'],
              ].map(([role, e]) => (
                <div key={role} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{role}</span>
                  <button
                    type="button"
                    onClick={() => { setEmail(e); setPassword('password123'); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-text)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'var(--font-sans)', textDecoration: 'underline' }}
                  >
                    {e}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
