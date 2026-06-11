import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPasswordVerify } from '../api/auth';

const FIELDS = [
  { key: 'email',        label: 'Email address',   type: 'email',    placeholder: 'you@example.com' },
  { key: 'first_name',   label: 'First name',       type: 'text',     placeholder: 'As registered' },
  { key: 'last_name',    label: 'Last name',        type: 'text',     placeholder: 'As registered' },
  { key: 'phone',        label: 'Phone number',     type: 'tel',      placeholder: 'As registered' },
  { key: 'new_password', label: 'New password',     type: 'password', placeholder: 'At least 8 characters' },
  { key: 'confirm',      label: 'Confirm password', type: 'password', placeholder: 'Repeat new password' },
];

export default function ForgotPassword() {
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', phone: '', new_password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Required';
    if (!form.first_name) e.first_name = 'Required';
    if (!form.last_name) e.last_name = 'Required';
    if (!form.phone) e.phone = 'Required';
    if (!form.new_password || form.new_password.length < 8) e.new_password = 'At least 8 characters';
    if (form.new_password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setServerError('');
    try {
      await resetPasswordVerify({
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        new_password: form.new_password,
      });
      setSuccess(true);
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const f = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm(p => ({ ...p, [key]: e.target.value }));
      setErrors(p => ({ ...p, [key]: undefined }));
    },
    className: errors[key] ? 'error' : '',
  });

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
        </div>

        <div style={{ fontSize: '0.75rem', color: 'oklch(55% 0.03 155)' }}>
          © 2026 Voices Education Group
        </div>
      </div>

      {/* Form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--content-bg)', padding: '48px 32px' }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'fadeSlideIn 0.4s both' }}>

          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'oklch(95% 0.04 155)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="oklch(28% 0.08 155)" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: 10 }}>Password Updated</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 32 }}>
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <Link
                to="/login"
                className="btn btn-primary"
                style={{ display: 'inline-block', padding: '12px 32px', textDecoration: 'none', fontSize: '0.95rem' }}
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Reset Password</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Verify your identity to set a new password.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                {FIELDS.map(({ key, label, type, placeholder }) => (
                  <div className="form-group" key={key}>
                    <label htmlFor={key}>{label}</label>
                    <input
                      id={key}
                      type={type}
                      placeholder={placeholder}
                      autoComplete="off"
                      {...f(key)}
                    />
                    {errors[key] && <div className="form-error">{errors[key]}</div>}
                  </div>
                ))}

                {serverError && (
                  <div style={{
                    padding: '10px 14px',
                    background: 'var(--status-urgent-bg)',
                    border: '1px solid var(--status-urgent-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--status-urgent)',
                    fontSize: '0.85rem',
                    marginBottom: 20,
                  }}>
                    {serverError}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: 4 }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      Verifying...
                    </>
                  ) : 'Reset Password'}
                </button>
              </form>

              <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Remembered it?{' '}
                <Link to="/login" style={{ color: 'var(--accent-text)', textDecoration: 'none', fontWeight: 500 }}>
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
