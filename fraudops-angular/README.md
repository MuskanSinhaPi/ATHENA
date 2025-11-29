# FraudOps Angular App

Angular application with payment flow, sandbox review page, and embedded React iframe.

## Features

- Payment submission form with validation
- Backend integration for fraud detection
- Sandbox review page for flagged transactions
- PostMessage integration with React FraudOps dashboard
- Global message listener for operator action notifications
- Test scenario buttons (safe payment / fraud scenario)
- NatWest-themed design

## Prerequisites

- Node.js 18+ and npm
- Angular CLI 17+

## Installation & Running

```bash
cd fraudops-angular
npm install
ng serve
```

The app will start on `http://localhost:4200`.

## Application Flow

1. **Payment Form** (`/`) - User enters payment details
2. **Submit Payment** - POST to backend `/api/payments/attempt`
3. **If flagged** - Navigate to `/sandbox/:txnId`
4. **Sandbox Page** - Displays "under review" status, posts transaction to React iframe
5. **React Dashboard** - Operator performs action
6. **Global Listener** - Receives `FRAUDOPS_ACTION` message and shows browser alert

## Routes

- `/` - Payment form (PaymentComponent)
- `/sandbox/:id` - Sandbox review page (SandboxComponent)

## PostMessage Integration

### Outgoing (Angular → React)

From `sandbox.component.ts`, after loading transaction:

```typescript
const iframe = document.getElementById('reactIframe') as HTMLIFrameElement;
iframe.contentWindow.postMessage({
  type: 'NEW_FLAGGED_TXN',
  txn: this.transaction,
  meta: {
    source: 'angular_demo',
    timestamp: new Date().toISOString()
  }
}, '*');
```

### Incoming (React → Angular)

Global listener in `index.html`:

```javascript
window.addEventListener('message', function(event) {
  const data = event.data;
  if (!data || data.type !== 'FRAUDOPS_ACTION') return;

  const message = data.message || `FraudOps ${data.action} on ${data.txn?.id}`;
  alert(message);
});
```

## Test Scenarios

### Safe Payment (no fraud detection)
- Customer: Sarah Johnson
- Recipient: Local Coffee Shop
- Amount: £45.50
- Message: "Weekly coffee supplies"
- Result: Payment processes normally, success message shown

### Fraud Scenario (triggers flag)
- Customer: Michael Brown
- Recipient: Account Verification Services
- Amount: £1,250
- Message: "URGENT: Please send OTP code immediately for refund processing"
- Result: Navigates to sandbox, posts to React iframe

## Testing Manually

### Test fraud keywords:
Try submitting payments with messages containing:
- `otp` or `OTP`
- `urgent` or `URGENT`
- `refund`
- `click`

These will trigger the backend's AI fraud detection.

## Architecture Notes

- **Standalone components** - Uses Angular 17+ standalone API
- **Reactive forms** - FormsModule with ngModel
- **HttpClient** - Backend API calls
- **Router** - Navigation between payment and sandbox
- **No sandbox alerts** - Only the global listener shows customer notifications
- **Embedded iframe** - React dashboard embedded in sidebar (500px width)
