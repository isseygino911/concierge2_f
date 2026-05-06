import { useState, useEffect } from 'react';
import { getPendingDeposits, updateDepositStatus } from '../../api/deposits';
import StatusPill from '../../components/ui/StatusPill';
import Button from '../../components/ui/Button';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DepositsTab() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    getPendingDeposits().then(setDeposits).finally(() => setLoading(false));
  }, []);

  const filtered = deposits.filter(d => filterStatus === 'all' || d.status === filterStatus);

  const handleApprove = async (deposit) => {
    setProcessing(deposit.deposit_id);
    try {
      await updateDepositStatus(deposit.deposit_id, 'approved');
      setDeposits(prev => prev.map(d =>
        d.deposit_id === deposit.deposit_id ? { ...d, status: 'approved' } : d
      ));
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (deposit) => {
    if (!rejectReason.trim()) return;
    setProcessing(deposit.deposit_id);
    try {
      await updateDepositStatus(deposit.deposit_id, 'rejected', rejectReason);
      setDeposits(prev => prev.map(d =>
        d.deposit_id === deposit.deposit_id ? { ...d, status: 'rejected' } : d
      ));
      setRejectId(null);
      setRejectReason('');
    } finally {
      setProcessing(null);
    }
  };

  const pendingCount = deposits.filter(d => d.status === 'pending').length;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Deposits</h2>
          <p>Review and process student deposit submissions</p>
        </div>
        {pendingCount > 0 && (
          <div style={{
            background: 'var(--status-urgent-bg)',
            border: '1px solid var(--status-urgent-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-5)',
            color: 'var(--status-urgent)',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}>
            {pendingCount} pending review
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        {[['all', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([val, label]) => (
          <button
            key={val}
            className={`tab${filterStatus === val ? ' active' : ''}`}
            onClick={() => setFilterStatus(val)}
          >
            {label}
            {val !== 'all' && (
              <span style={{ marginLeft: 6, fontSize: '0.7rem', opacity: 0.7 }}>
                ({deposits.filter(d => d.status === val).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Organization</th>
              <th style={{ width: 120 }}>Amount</th>
              <th style={{ width: 120 }}>Submitted</th>
              <th style={{ width: 100 }}>Status</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>{[1,2,3,4,5,6].map(j => (
                  <td key={j}><div className="skeleton" style={{ height: 16, width: '70%' }} /></td>
                ))}</tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No deposits found</td></tr>
            ) : (
              filtered.map(deposit => (
                <>
                  <tr key={deposit.deposit_id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{deposit.student_name || deposit.first_name + ' ' + deposit.last_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{deposit.student_id}</div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{deposit.org_name}</td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        ¥{Number(deposit.amount).toLocaleString()}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{timeAgo(deposit.created_at)}</td>
                    <td><StatusPill status={deposit.status} /></td>
                    <td>
                      {deposit.status === 'pending' ? (
                        <div className="table-actions">
                          <Button
                            size="sm"
                            variant="primary"
                            loading={processing === deposit.deposit_id}
                            onClick={() => handleApprove(deposit)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={processing === deposit.deposit_id}
                            onClick={() => setRejectId(rejectId === deposit.deposit_id ? null : deposit.deposit_id)}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          {deposit.status === 'approved' ? 'Approved' : 'Rejected'}
                        </span>
                      )}
                    </td>
                  </tr>
                  {/* Inline reject reason */}
                  {rejectId === deposit.deposit_id && (
                    <tr key={`${deposit.deposit_id}-reject`} style={{ background: 'var(--status-urgent-bg)' }}>
                      <td colSpan={6} style={{ padding: 'var(--space-4) var(--space-5)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ textTransform: 'none', fontSize: '0.8rem', fontWeight: 600, color: 'var(--status-urgent)', marginBottom: 6 }}>
                              Reason for rejection
                            </label>
                            <textarea
                              rows={2}
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              placeholder="Describe why this deposit is being rejected..."
                              style={{ resize: 'none' }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: 'var(--space-2)', paddingTop: 22 }}>
                            <Button size="sm" variant="ghost" onClick={() => { setRejectId(null); setRejectReason(''); }}>Cancel</Button>
                            <Button
                              size="sm"
                              variant="danger"
                              loading={processing === deposit.deposit_id}
                              disabled={!rejectReason.trim()}
                              onClick={() => handleReject(deposit)}
                            >
                              Confirm Reject
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
