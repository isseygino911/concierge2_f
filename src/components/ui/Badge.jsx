export default function Badge({ children, color = 'accent', size = 'sm' }) {
  const styles = {
    accent: { background: 'var(--accent-light)', color: 'var(--accent-text)', border: '1px solid var(--accent)' },
    green: { background: 'var(--status-active-bg)', color: 'var(--status-active)', border: '1px solid var(--status-active-border)' },
    red: { background: 'var(--status-urgent-bg)', color: 'var(--status-urgent)', border: '1px solid var(--status-urgent-border)' },
    gray: { background: 'var(--status-inactive-bg)', color: 'var(--status-inactive)', border: '1px solid var(--status-inactive-border)' },
  };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: size === 'sm' ? '2px 8px' : '4px 12px',
      borderRadius: '20px',
      fontSize: size === 'sm' ? '0.72rem' : '0.8rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      ...styles[color],
    }}>
      {children}
    </span>
  );
}
