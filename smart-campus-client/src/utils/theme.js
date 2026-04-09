// Shared style helpers — Navy & Gold theme
export const card = {
  background: 'white',
  border: '1px solid var(--border)',
  borderRadius: '16px',
}

export const cardDark = {
  background: 'var(--navy)',
  border: '1px solid rgba(201,168,76,0.15)',
  borderRadius: '16px',
}

export const pageWrap = {
  minHeight: '100vh',
  background: 'var(--surface)',
}

export const btnPrimary = {
  background: 'var(--navy)',
  color: 'white',
}

export const btnGold = {
  background: 'var(--gold)',
  color: 'white',
}

export const btnGhost = {
  background: 'transparent',
  border: '1.5px solid var(--border)',
  color: 'var(--text)',
}

export const STATUS_STYLES = {
  PENDING:   { bg: '#fef9c3', text: '#854d0e',  border: '#fde047' },
  APPROVED:  { bg: '#dcfce7', text: '#166534',  border: '#86efac' },
  REJECTED:  { bg: '#fee2e2', text: '#991b1b',  border: '#fca5a5' },
  CANCELLED: { bg: '#f1f5f9', text: '#64748b',  border: '#cbd5e1' },
  OPEN:        { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  IN_PROGRESS: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  RESOLVED:    { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  CLOSED:      { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
}

export const PRIORITY_STYLES = {
  LOW:      { text: '#16a34a' },
  MEDIUM:   { text: '#d97706' },
  HIGH:     { text: '#ea580c' },
  CRITICAL: { text: '#dc2626' },
}

export const statusBadge = (status) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.CANCELLED
  return {
    background: s.bg,
    color: s.text,
    border: `1px solid ${s.border}`,
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 10px',
  }
}