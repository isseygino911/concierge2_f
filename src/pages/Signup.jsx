import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signup } from '../api/auth';

export default function Signup() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  if (isAuthenticated && user) {
    navigate('/sales', { replace: true });
    return null;
  }

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email is required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const result = await signup({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
      });
      // Auto-login using returned token
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      window.location.href = '/sales';
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const eyeIcon = (
    <button
      type="button"
      onClick={() => setShowPw(p => !p)}
      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}
      aria-label={showPw ? 'Hide password' : 'Show password'}
    >
      {showPw ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
      )}
    </button>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Brand panel — matches Login */}
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
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 320, height: 320, borderRadius: '50%', border: '1px solid oklch(40% 0.06 155)' }} />
        <div style={{ position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', border: '1px solid oklch(38% 0.07 155)' }} />

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
              <span key={tag} style={{ padding: '4px 12px', borderRadius: 20, border: '1px solid oklch(38% 0.07 155)', fontSize: '0.75rem', color: 'oklch(72% 0.04 90)', letterSpacing: '0.04em' }}>{tag}</span>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'oklch(55% 0.03 155)' }}>
          © 2026 Voices Education Group
        </div>
      </div>

      {/* Form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--content-bg)', padding: '48px 32px' }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'fadeSlideIn 0.4s both' }}>
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Create account</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Sales representative access
            </p>
          </div>

          {apiError && (
            <div style={{ padding: '10px 14px', background: 'var(--status-urgent-bg)', border: '1px solid var(--status-urgent-border)', borderRadius: 'var(--radius-md)', color: 'var(--status-urgent)', fontSize: '0.85rem', marginBottom: 20 }}>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="firstName">First name</label>
                <input id="firstName" type="text" value={form.firstName} onChange={set('firstName')} placeholder="Jane" autoComplete="given-name" className={errors.firstName ? 'error' : ''} />
                {errors.firstName && <div className="form-error">{errors.firstName}</div>}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="lastName">Last name</label>
                <input id="lastName" type="text" value={form.lastName} onChange={set('lastName')} placeholder="Smith" autoComplete="family-name" className={errors.lastName ? 'error' : ''} />
                {errors.lastName && <div className="form-error">{errors.lastName}</div>}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" value={form.email} onChange={set('email')} placeholder="you@organization.com" autoComplete="email" className={errors.email ? 'error' : ''} />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input id="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min. 8 characters" autoComplete="new-password" style={{ paddingRight: 44 }} className={errors.password ? 'error' : ''} />
                {eyeIcon}
              </div>
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="confirm">Confirm password</label>
              <input id="confirm" type={showPw ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" autoComplete="new-password" className={errors.confirm ? 'error' : ''} />
              {errors.confirm && <div className="form-error">{errors.confirm}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: 4 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Creating account...
                </>
              ) : 'Create account'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-text)', textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
