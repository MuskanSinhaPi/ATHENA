# FraudOps Dashboard (React + Vite)

React-based operator dashboard for fraud detection and transaction management.

## Features

- Real-time transaction monitoring
- In-memory transaction database with seed data
- Operator action controls (Approve, Reject, Escalate, Call Customer)
- Escrow management modal (Hold, Release, Partial Refund, Raise Dispute)
- Activity log with timestamps
- PostMessage integration with Angular host
- AI fraud explanations and semantic context
- NatWest-themed design

## Prerequisites

- Node.js 18+ and npm

## Installation & Running

```bash
cd fraudops-dashboard
npm install
npm run dev
```

The dashboard will start on `http://localhost:5173`.

## PostMessage Integration

### Incoming Messages (from Angular)

The dashboard listens for messages with type `NEW_FLAGGED_TXN`:

```javascript
window.postMessage({
  type: 'NEW_FLAGGED_TXN',
  txn: {
    id: 'txn_123',
    customer: 'John Doe',
    phone: '+44 7700 900000',
    amount: 1250,
    currency: 'GBP',
    recipient: 'Suspicious Account',
    method: 'bank_transfer',
    message: 'URGENT - send OTP',
    reason: 'AI detected suspicious pattern',
    createdAt: '2025-11-29T10:00:00Z',
    status: 'FLAGGED',
    sandbox: true,
    escrow: {
      heldAmount: 1250,
      releasedAmount: 0,
      holds: [
        {
          action: 'HOLD',
          amount: 1250,
          timestamp: '2025-11-29T10:00:00Z',
          reason: 'Initial fraud flag'
        }
      ],
      disputes: []
    },
    llmExplanation: 'Message contains high-risk keywords...',
    semanticContext: 'Payment urgency + credential request = high fraud probability'
  },
  meta: {
    source: 'angular_demo',
    timestamp: '2025-11-29T10:00:00Z'
  }
}, '*');
```

### Outgoing Messages (to Angular)

When an operator performs an action, the dashboard posts:

```javascript
window.parent.postMessage({
  type: 'FRAUDOPS_ACTION',
  action: 'APPROVE',
  txn: { ...updatedTransaction },
  entry: { ...activityLogEntry },
  message: 'Transaction txn_123: APPROVE - APPROVED'
}, '*');
```

## Testing in Browser Console

### Simulate a new flagged transaction:

```javascript
const iframe = document.getElementById('reactIframe');
iframe.contentWindow.postMessage({
  type: 'NEW_FLAGGED_TXN',
  txn: {
    id: 'test-' + Date.now(),
    customer: 'Console Test User',
    phone: '+44 7700 900999',
    amount: 500,
    currency: 'GBP',
    recipient: 'Test Recipient',
    method: 'bank_transfer',
    message: 'Urgent - please click this link for refund',
    reason: 'Console test',
    createdAt: new Date().toISOString(),
    status: 'FLAGGED',
    sandbox: true,
    escrow: {
      heldAmount: 500,
      releasedAmount: 0,
      holds: [{
        action: 'HOLD',
        amount: 500,
        timestamp: new Date().toISOString(),
        reason: 'Test hold'
      }],
      disputes: []
    },
    llmExplanation: 'Test flagged transaction',
    semanticContext: 'Console test scenario'
  },
  meta: { source: 'browser_console' }
}, '*');
```

## Architecture

- **In-memory database**: Transactions stored in React state
- **No backend dependency**: All operations are local for fastest demo
- **PostMessage only**: Communication via iframe postMessage API
- **Seed data**: 2 pre-loaded flagged transactions for immediate demo

## Operator Actions

1. **Approve** - Mark transaction as legitimate, release escrow
2. **Reject** - Block transaction, mark as fraud
3. **Escalate** - Send to senior fraud analyst
4. **Call Customer** - Mark for phone verification
5. **Hold in Escrow** - Add additional hold event
6. **Release Funds** - Release all held funds
7. **Partial Refund** - Issue 50% refund
8. **Raise Dispute** - File formal dispute
