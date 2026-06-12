import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validateToken, registerFromInvite } from '../../api/auth';

export default function OrgRegister() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading | ready | submitting | success | error
  const [tokenData, setTokenData] = useState(null);
  const [tokenError, setTokenError] = useState('');
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    validateToken(token)
      .then(data => { setTokenData(data); setStatus('ready'); })
      .catch(() => { setTokenError('This invitation link is invalid, expired, or has already been used. Please contact your sales representative.'); setStatus('error'); });
  }, [token]);

  const validate = () => {
    const e = {};
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setStatus('submitting');
    setSubmitError('');
    try {
      await registerFromInvite({ token, password: form.password });
      setStatus('success');
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Something went wrong. Please try again.');
      setStatus('ready');
    }
  };

  const f = (field) => ({
    value: form[field],
    onChange: ev => { setForm(p => ({ ...p, [field]: ev.target.value })); setErrors(p => ({ ...p, [field]: undefined })); },
    className: errors[field] ? 'error' : '',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'oklch(97% 0.01 90)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'DM Sans, Plus Jakarta Sans, sans-serif',
    }}>
      {/* Logo / brand */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: 'oklch(28% 0.08 155)', letterSpacing: '-0.02em' }}>
          VS Concierge
        </div>
        <div style={{ fontSize: '0.8rem', color: 'oklch(50% 0.02 90)', marginTop: 4 }}>Account Activation</div>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            <div className="skeleton" style={{ height: 16, width: '60%', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ height: 16, width: '40%', margin: '0 auto' }} />
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <div style={{ fontWeight: 600, marginBottom: 8, color: 'oklch(18% 0.02 240)' }}>Invalid Invitation</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{tokenError}</div>
          </div>
        )}

        {(status === 'ready' || status === 'submitting') && tokenData && (
          <>
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 700, color: 'oklch(18% 0.02 240)', marginBottom: 6 }}>
                Set Your Password
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {tokenData.org_name
                  ? <>Welcome to <strong style={{ color: 'oklch(18% 0.02 240)' }}>{tokenData.org_name}</strong>. Create a password for <strong style={{ color: 'oklch(18% 0.02 240)' }}>{tokenData.email}</strong>.</>
                  : <>Create a password for <strong style={{ color: 'oklch(18% 0.02 240)' }}>{tokenData.email}</strong>.</>
                }
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="At least 8 characters" {...f('password')} />
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="Repeat your password" {...f('confirm')} />
                {errors.confirm && <div className="form-error">{errors.confirm}</div>}
              </div>

              {submitError && (
                <div style={{ background: 'var(--status-rejected-bg, #fff0f0)', border: '1px solid var(--status-rejected-border, #ffcccc)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 16, fontSize: '0.83rem', color: 'var(--status-rejected, #c00)' }}>
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  background: 'oklch(28% 0.08 155)',
                  color: 'oklch(92% 0.02 90)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                  opacity: status === 'submitting' ? 0.7 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                {status === 'submitting' ? 'Setting password…' : 'Set Password & Activate Account'}
              </button>
            </form>
          </>
        )}

        {status === 'success' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'oklch(95% 0.04 155)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="oklch(28% 0.08 155)" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 700, color: 'oklch(18% 0.02 240)', marginBottom: 8 }}>
              Account Activated
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              Your password has been set. You can now log in to your account.
            </div>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '0.6rem 1.5rem',
                background: 'oklch(28% 0.08 155)',
                color: 'oklch(92% 0.02 90)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
