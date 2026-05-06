import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--content-bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '6rem', fontWeight: 700, color: 'var(--border)', lineHeight: 1, marginBottom: 'var(--space-4)' }}>404</div>
        <h2 style={{ marginBottom: 'var(--space-3)' }}>Page not found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>The page you're looking for doesn't exist.</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      </div>
    </div>
  );
}
