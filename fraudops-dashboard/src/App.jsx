import { useState, useEffect } from 'react';
import Header from './components/Header';

const INITIAL_TXNS = [
  {
    id: 'demo-001',
    customer: 'Alice Thompson',
    phone: '+44 7700 900123',
    amount: 2500,
    currency: 'GBP',
    recipient: 'Tech Support Services',
    method: 'bank_transfer',
    reason: 'AI detected suspicious pattern',
    createdAt: new Date().toISOString(),
    status: 'FLAGGED',
    sandbox: true,
    message: 'Urgent - please send OTP to verify account',
    escrow: {
      heldAmount: 2500,
      releasedAmount: 0,
      holds: [{ action: 'HOLD', amount: 2500, timestamp: new Date().toISOString(), reason: 'Initial fraud flag' }],
      disputes: []
    },
    llmExplanation: 'Message contains high-risk keywords (urgent, OTP) commonly used in social engineering.',
    semanticContext: 'Payment urgency + credential request = high fraud probability'
  },
  {
    id: 'demo-002',
    customer: 'Bob Martinez',
    phone: '+44 7700 900456',
    amount: 850,
    currency: 'GBP',
    recipient: 'Refund Processing Ltd',
    method: 'bank_transfer',
    reason: 'AI detected suspicious pattern',
    createdAt: new Date(Date.now() - 300000).toISOString(),
    status: 'FLAGGED',
    sandbox: true,
    message: 'Click here for immediate refund processing',
    escrow: {
      heldAmount: 850,
      releasedAmount: 0,
      holds: [{ action: 'HOLD', amount: 850, timestamp: new Date(Date.now() - 300000).toISOString(), reason: 'Initial fraud flag' }],
      disputes: []
    },
    llmExplanation: 'Phishing pattern detected with action-oriented language (click, immediate).',
    semanticContext: 'Unexpected refund request + urgency = potential scam'
  }
];

function App() {
  const [transactions, setTransactions] = useState(INITIAL_TXNS);
  const [activityLog, setActivityLog] = useState([]);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [showSandbox, setShowSandbox] = useState(false);

  useEffect(() => {
    const handleMessage = (event) => {
      const data = event.data;
      console.log('[FraudOps] Received message:', data);

      if (!data || data.type !== 'NEW_FLAGGED_TXN') return;

      const newTxn = data.txn;
      console.log('[FraudOps] Adding new flagged transaction:', newTxn.id);

      setTransactions(prev => {
        const exists = prev.find(t => t.id === newTxn.id);
        if (exists) return prev;
        return [newTxn, ...prev];
      });

      const logEntry = {
        timestamp: new Date().toISOString(),
        type: 'NEW_TXN',
        txnId: newTxn.id,
        message: `New flagged transaction from ${newTxn.customer} - £${newTxn.amount}`
      };
      setActivityLog(prev => [logEntry, ...prev]);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const performAction = (txn, action, details = '') => {
    console.log(`[FraudOps] Performing action ${action} on ${txn.id}`);

    const updatedTxn = { ...txn };

    switch (action) {
      case 'APPROVE':
        updatedTxn.status = 'APPROVED';
        if (updatedTxn.escrow) {
          const held = updatedTxn.escrow.heldAmount;
          updatedTxn.escrow.heldAmount = 0;
          updatedTxn.escrow.releasedAmount = held;
          updatedTxn.escrow.holds.push({
            action: 'RELEASE',
            amount: held,
            timestamp: new Date().toISOString(),
            reason: 'Approved by operator'
          });
        }
        break;

      case 'REJECT':
        updatedTxn.status = 'REJECTED';
        if (updatedTxn.escrow) {
          updatedTxn.escrow.heldAmount = 0;
          updatedTxn.escrow.holds.push({
            action: 'REJECT',
            amount: txn.amount,
            timestamp: new Date().toISOString(),
            reason: details || 'Rejected by operator'
          });
        }
        break;

      case 'ESCALATE':
        updatedTxn.status = 'ESCALATED';
        break;

      case 'CALL_CUSTOMER':
        updatedTxn.status = 'CALLING';
        break;

      case 'HOLD_ESCROW':
        if (updatedTxn.escrow) {
          updatedTxn.escrow.holds.push({
            action: 'HOLD',
            amount: txn.amount,
            timestamp: new Date().toISOString(),
            reason: details || 'Additional hold'
          });
        }
        break;

      case 'RELEASE_ESCROW':
        if (updatedTxn.escrow) {
          const held = updatedTxn.escrow.heldAmount;
          updatedTxn.escrow.heldAmount = 0;
          updatedTxn.escrow.releasedAmount = held;
          updatedTxn.escrow.holds.push({
            action: 'RELEASE',
            amount: held,
            timestamp: new Date().toISOString(),
            reason: details || 'Released by operator'
          });
        }
        updatedTxn.status = 'RELEASED';
        break;

      case 'PARTIAL_REFUND':
        if (updatedTxn.escrow) {
          const refundAmount = txn.amount * 0.5;
          updatedTxn.escrow.holds.push({
            action: 'PARTIAL_REFUND',
            amount: refundAmount,
            timestamp: new Date().toISOString(),
            reason: details || 'Partial refund issued'
          });
        }
        break;

      case 'RAISE_DISPUTE':
        if (updatedTxn.escrow) {
          updatedTxn.escrow.disputes.push(details || 'Dispute raised by operator');
        }
        updatedTxn.status = 'DISPUTED';
        break;
    }

    setTransactions(prev => prev.map(t => t.id === txn.id ? updatedTxn : t));

    const logEntry = {
      timestamp: new Date().toISOString(),
      type: action,
      txnId: txn.id,
      message: `${action} executed on ${txn.id} by operator`,
      details
    };
    setActivityLog(prev => [logEntry, ...prev]);

    const actionMessage = `Transaction ${txn.id}: ${action} - ${updatedTxn.status}`;
    console.log('[FraudOps] Posting action to parent:', actionMessage);

    window.parent.postMessage({
      type: 'FRAUDOPS_ACTION',
      action,
      txn: updatedTxn,
      entry: logEntry,
      message: actionMessage
    }, '*');

    if (selectedTxn?.id === txn.id) {
      setSelectedTxn(updatedTxn);
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'FLAGGED': return 'badge flagged';
      case 'APPROVED': return 'badge approved';
      case 'REJECTED': return 'badge rejected';
      case 'ESCALATED': return 'badge escalated';
      default: return 'badge';
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
          <div>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                Flagged Transactions ({transactions.length})
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {transactions.map(txn => (
                <div key={txn.id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '15px' }}>{txn.customer}</strong>
                        <span className={getBadgeClass(txn.status)}>{txn.status}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--nw-muted)' }}>
                        {txn.phone} • {new Date(txn.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--nw-primary)' }}>
                        £{txn.amount.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--nw-muted)' }}>{txn.currency}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px', padding: '10px', background: '#F9FAFB', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--nw-muted)', marginBottom: '4px' }}>Recipient</div>
                    <div style={{ fontSize: '14px' }}>{txn.recipient}</div>
                  </div>

                  <div style={{ marginBottom: '12px', padding: '10px', background: '#FEF3C7', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                    <div style={{ fontSize: '12px', color: '#92400E', marginBottom: '4px' }}>Message</div>
                    <div style={{ fontSize: '14px', color: '#78350F' }}>{txn.message}</div>
                  </div>

                  {txn.llmExplanation && (
                    <div style={{ marginBottom: '12px', padding: '10px', background: '#EDE9FE', borderRadius: '6px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--nw-primary)', marginBottom: '4px', fontWeight: 600 }}>
                        AI Analysis
                      </div>
                      <div style={{ fontSize: '13px', color: '#5B21B6' }}>{txn.llmExplanation}</div>
                      {txn.semanticContext && (
                        <div style={{ fontSize: '12px', color: '#7C3AED', marginTop: '6px', fontStyle: 'italic' }}>
                          {txn.semanticContext}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="primary" onClick={() => performAction(txn, 'APPROVE')}>
                      Approve
                    </button>
                    <button className="danger" onClick={() => performAction(txn, 'REJECT', 'Confirmed fraud')}>
                      Reject
                    </button>
                    <button className="secondary" onClick={() => performAction(txn, 'ESCALATE')}>
                      Escalate
                    </button>
                    <button className="secondary" onClick={() => performAction(txn, 'CALL_CUSTOMER')}>
                      Call Customer
                    </button>
                    <button className="accent" onClick={() => {
                      setSelectedTxn(txn);
                      setShowSandbox(true);
                    }}>
                      Escrow Actions
                    </button>
                  </div>
                </div>
              ))}

              {transactions.length === 0 && (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--nw-muted)' }}>
                  No flagged transactions
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700 }}>Activity Log</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activityLog.slice(0, 20).map((log, idx) => (
                <div key={idx} className="card" style={{ padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--nw-muted)', marginBottom: '4px' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--nw-primary)', marginBottom: '2px' }}>
                    {log.type}
                  </div>
                  <div style={{ fontSize: '12px' }}>{log.message}</div>
                  {log.details && (
                    <div style={{ fontSize: '11px', color: 'var(--nw-muted)', marginTop: '4px' }}>
                      {log.details}
                    </div>
                  )}
                </div>
              ))}

              {activityLog.length === 0 && (
                <div className="card" style={{ padding: '20px', textAlign: 'center', color: 'var(--nw-muted)' }}>
                  No activity yet
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showSandbox && selectedTxn && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowSandbox(false)}>
          <div className="card" style={{
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            padding: '24px'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Escrow Management</h2>
              <button className="secondary" onClick={() => setShowSandbox(false)}>Close</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: 'var(--nw-muted)', marginBottom: '4px' }}>Transaction ID</div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedTxn.id}</div>
            </div>

            {selectedTxn.escrow && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="card" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
                    <div style={{ fontSize: '12px', color: '#92400E', marginBottom: '4px' }}>Held Amount</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#78350F' }}>
                      £{selectedTxn.escrow.heldAmount.toFixed(2)}
                    </div>
                  </div>
                  <div className="card" style={{ background: '#D1FAE5', border: '1px solid #A7F3D0' }}>
                    <div style={{ fontSize: '12px', color: '#065F46', marginBottom: '4px' }}>Released Amount</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#047857' }}>
                      £{selectedTxn.escrow.releasedAmount.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Escrow Timeline</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedTxn.escrow.holds.map((hold, idx) => (
                      <div key={idx} style={{
                        padding: '12px',
                        background: '#F9FAFB',
                        borderRadius: '6px',
                        borderLeft: '3px solid var(--nw-primary)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600 }}>{hold.action}</span>
                          <span style={{ fontSize: '12px', color: 'var(--nw-muted)' }}>
                            {new Date(hold.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--nw-muted)' }}>
                          Amount: £{hold.amount.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '13px', marginTop: '4px' }}>{hold.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTxn.escrow.disputes.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Disputes</h3>
                    {selectedTxn.escrow.disputes.map((dispute, idx) => (
                      <div key={idx} className="card" style={{ background: '#FEE2E2', marginBottom: '8px' }}>
                        {dispute}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Escrow Actions</h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="secondary" onClick={() => {
                      performAction(selectedTxn, 'HOLD_ESCROW', 'Additional hold requested');
                      setShowSandbox(false);
                    }}>
                      Hold in Escrow
                    </button>
                    <button className="primary" onClick={() => {
                      performAction(selectedTxn, 'RELEASE_ESCROW', 'Verified legitimate');
                      setShowSandbox(false);
                    }}>
                      Release Funds
                    </button>
                    <button className="accent" onClick={() => {
                      performAction(selectedTxn, 'PARTIAL_REFUND', '50% partial refund');
                      setShowSandbox(false);
                    }}>
                      Partial Refund
                    </button>
                    <button className="danger" onClick={() => {
                      performAction(selectedTxn, 'RAISE_DISPUTE', 'Customer dispute filed');
                      setShowSandbox(false);
                    }}>
                      Raise Dispute
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
