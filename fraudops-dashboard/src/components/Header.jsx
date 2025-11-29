export default function Header() {
  return (
    <header style={{
      background: 'var(--nw-surface)',
      padding: '16px 24px',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }}>
      <div className="brand-mark">NW</div>
      <div>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
          NatWest FraudOps Dashboard
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--nw-muted)' }}>
          Real-time fraud detection & operator controls
        </p>
      </div>
    </header>
  );
}
