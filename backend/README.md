# FraudOps Backend (Spring Boot)

Simple Spring Boot backend with in-memory transaction storage for the FraudOps demo.

## Features

- AI-based fraud detection (keyword matching: otp, urgent, refund, click)
- Transaction lifecycle management
- Escrow operations (hold, release, refund, dispute)
- Operator actions (approve, reject, escalate, call customer)
- Mock LLM explanations and semantic context

## Prerequisites

- Java 17 or higher
- Maven 3.6+

## Running the Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`.

## API Endpoints

### POST /api/payments/attempt
Submit a payment for processing. Returns flagged status and transaction ID.

**Request body:**
```json
{
  "customer": "John Doe",
  "phone": "+44 7700 900000",
  "recipient": "Recipient Name",
  "amount": 100.50,
  "message": "Payment message",
  "sessionId": "sess_xyz",
  "deviceFingerprint": "fp_abc",
  "behavior": "normal"
}
```

**Response (flagged):**
```json
{
  "flagged": true,
  "txnId": "uuid",
  "message": "Payment flagged for review"
}
```

**Response (not flagged):**
```json
{
  "flagged": false,
  "txnId": "uuid",
  "message": "Payment processed successfully"
}
```

### GET /api/transactions/flagged
List all flagged transactions.

### GET /api/transactions/{id}
Get a specific transaction by ID.

### POST /api/transactions/{id}/action
Perform an operator action on a transaction.

**Request body:**
```json
{
  "action": "APPROVE|REJECT|ESCALATE|CALL_CUSTOMER|HOLD_ESCROW|RELEASE_ESCROW|PARTIAL_REFUND|RAISE_DISPUTE",
  "details": "Optional details"
}
```

## Testing with cURL

### Test normal payment:
```bash
curl -X POST http://localhost:8080/api/payments/attempt \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "Alice Test",
    "phone": "+44 7700 900111",
    "recipient": "Coffee Shop",
    "amount": 25.50,
    "message": "Weekly supplies"
  }'
```

### Test flagged payment:
```bash
curl -X POST http://localhost:8080/api/payments/attempt \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "Bob Test",
    "phone": "+44 7700 900222",
    "recipient": "Suspicious Account",
    "amount": 1500,
    "message": "URGENT - send OTP for refund"
  }'
```

### Get flagged transactions:
```bash
curl http://localhost:8080/api/transactions/flagged
```

### Approve a transaction:
```bash
curl -X POST http://localhost:8080/api/transactions/{TRANSACTION_ID}/action \
  -H "Content-Type: application/json" \
  -d '{
    "action": "APPROVE",
    "details": "Verified with customer"
  }'
```
