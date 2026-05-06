export default function StatusPill({ status, label }) {
  const display = label || status;
  const cls = `pill pill-${status?.toLowerCase().replace(/\s+/g, '_') || 'inactive'}`;
  return (
    <span className={cls}>
      <span className="pill-dot" />
      {display}
    </span>
  );
}
