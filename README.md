# ATHENA - FraudOps Payment Flow Demo

Hackathon-ready prototype showcasing an Angular payment flow with real-time fraud detection and an embedded React FraudOps dashboard for operator review.

## Overview

This demo simulates a banking payment system where suspicious transactions are flagged by AI, routed to a sandbox for review, and displayed in a React-based FraudOps dashboard where operators can take action. Actions are communicated back to the Angular host via postMessage, and the customer receives a browser alert with the final decision.

## Architecture

- **Backend**: Spring Boot (Java 17) with in-memory transaction storage
- **FraudOps Dashboard**: React 18 + Vite (port 5173)
- **Payment App**: Angular 17 (port 4200)
- **Integration**: iframe + postMessage for real-time communication

## Features

### AI Fraud Detection
- Automatic flagging based on message content
- Keywords: `otp`, `urgent`, `refund`, `click`
- Mock LLM explanations and semantic context

### Operator Dashboard
- Real-time transaction monitoring
- In-memory database with seed data
- 8 operator actions: Approve, Reject, Escalate, Call Customer, Hold Escrow, Release, Partial Refund, Raise Dispute
- Activity log with timestamps
- Escrow management modal

### Payment Flow
- User-friendly payment form
- Sandbox review page for flagged transactions
- PostMessage integration
- Global listener for operator notifications
- Test scenario buttons

### Styling
- NatWest-themed design (deep purple #672C8E + magenta accent #D94FA1)
- Consistent header with placeholder logo
- Responsive card-based layouts

## Quick Start

### 1. Start Backend (Terminal 1)
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`

### 2. Start React Dashboard (Terminal 2)
```bash
cd fraudops-dashboard
npm install
npm run dev
```
Dashboard runs on `http://localhost:5173`

### 3. Start Angular App (Terminal 3)
```bash
cd fraudops-angular
npm install
ng serve
```
App runs on `http://localhost:4200`

### 4. Open Browser
Navigate to `http://localhost:4200`

## Demo Flow

1. **Submit Payment** - Enter payment details or click "Fraud Scenario" button
2. **AI Flags Transaction** - Backend detects suspicious keywords
3. **Navigate to Sandbox** - Angular shows "Processing — under review" page
4. **PostMessage to React** - Transaction appears in React dashboard within seconds
5. **Operator Action** - Click "Approve", "Reject", or other actions in React
6. **Browser Alert** - Angular global listener shows alert with decision

## Testing the Demo

### Test Case 1: Normal Payment
1. Click "Safe Payment" button in Angular
2. Click "Submit Payment"
3. See success message (no flag)

### Test Case 2: Flagged Payment
1. Click "Fraud Scenario" button in Angular
2. Click "Submit Payment"
3. Navigates to sandbox page
4. React dashboard receives transaction (check activity log)
5. Click "Approve" in React
6. See browser alert in Angular: "Transaction {id}: APPROVE - APPROVED"

### Test Case 3: Manual Fraud Trigger
1. Enter any payment details
2. In message field, type: "Please send your OTP urgently for refund"
3. Submit payment
4. Transaction gets flagged and flows through sandbox → React

### Test Case 4: Escrow Actions
1. Wait for a flagged transaction in React
2. Click "Escrow Actions" button
3. Modal opens showing held/released amounts
4. Click "Release Funds" or "Partial Refund"
5. Timeline updates, alert appears in Angular

## Project Structure

```
.
├── backend/                    # Spring Boot backend
│   ├── src/main/java/com/natwest/fraudops/
│   │   ├── FraudOpsApplication.java
│   │   ├── controller/TransactionController.java
│   │   └── model/
│   │       ├── Transaction.java
│   │       ├── Escrow.java
│   │       └── EscrowEvent.java
│   └── pom.xml
│
├── fraudops-dashboard/         # React FraudOps dashboard
│   ├── src/
│   │   ├── App.jsx            # Main dashboard component
│   │   ├── components/Header.jsx
│   │   └── index.css          # NatWest theme
│   ├── package.json
│   └── vite.config.js
│
├── fraudops-angular/           # Angular payment app
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts
│   │   │   ├── payment/payment.component.ts
│   │   │   └── sandbox/sandbox.component.ts
│   │   ├── index.html         # Global postMessage listener
│   │   └── styles.css         # NatWest theme
│   ├── package.json
│   └── angular.json
│
└── README.md                   # This file
```

## API Endpoints

### POST /api/payments/attempt
Submit payment for fraud check
- Returns: `{ flagged: boolean, txnId: string, message: string }`

### GET /api/transactions/flagged
List all flagged transactions

### GET /api/transactions/{id}
Get transaction by ID

### POST /api/transactions/{id}/action
Perform operator action
- Body: `{ action: string, details: string }`

## PostMessage Protocol

### Angular → React: NEW_FLAGGED_TXN
```javascript
{
  type: 'NEW_FLAGGED_TXN',
  txn: { id, customer, amount, ... },
  meta: { source, timestamp }
}
```

### React → Angular: FRAUDOPS_ACTION
```javascript
{
  type: 'FRAUDOPS_ACTION',
  action: 'APPROVE',
  txn: { ...updatedTransaction },
  entry: { ...logEntry },
  message: 'Transaction {id}: {action} - {status}'
}
```

## Styling Theme

NatWest-like color scheme:
- Primary: `#672C8E` (deep purple)
- Accent: `#D94FA1` (magenta)
- Background: `#F7F7FB` (light grey)
- Surface: `#FFFFFF` (white)

## Troubleshooting

### React not loading in iframe
- Check React dev server is running on port 5173
- Check browser console for CORS errors
- Verify iframe src in `app.component.ts`

### PostMessage not working
- Check browser console for message logs
- Verify iframe ID is `reactIframe`
- Check message type matches exactly

### Backend connection refused
- Ensure backend is running on port 8080
- Check CORS is enabled (`@CrossOrigin("*")`)
- Verify API URL in Angular components

## Production Notes

For production deployment:
- Replace `@CrossOrigin("*")` with specific origins
- Replace postMessage `'*'` target with specific origin
- Add proper authentication and authorization
- Use persistent database instead of in-memory storage
- Add rate limiting and DDoS protection
- Implement proper error handling and retry logic

## Demo Recording Tips

1. Open browser with console visible (F12)
2. Start screen recording
3. Show Angular payment form
4. Click "Fraud Scenario" button
5. Submit payment
6. Show sandbox page with spinner
7. Switch to React iframe - show new transaction in list
8. Click "Approve" button
9. Show browser alert appearing
10. Show activity log updated

## License

MIT
