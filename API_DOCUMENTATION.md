# LEGENDO SYNC - API Documentation

## Overview

LEGENDO SYNC is a vault-grade AI executor designed for asset synchronization and PayPal payment processing. This system provides a robust API for handling asset management and payment operations with high security and reliability.

## Table of Contents

1. [Getting Started](#getting-started)
2. [API Endpoints](#api-endpoints)
3. [Authentication](#authentication)
4. [Request/Response Formats](#requestresponse-formats)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)
8. [SDK Support](#sdk-support)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- PayPal Developer Account
- Valid PayPal API credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/HuzoBaz/legendo-sync.git
cd legendo-sync

# Install dependencies
npm install express paypal-rest-sdk dotenv

# Set up environment variables
cp .env.example .env
# Edit .env with your PayPal credentials
```

### Environment Variables

Create a `.env` file with the following variables:

```env
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_EMAIL=your_paypal_email@example.com
PORT=3000
NODE_ENV=development
```

### Running the Server

```bash
# Start the development server
npm start

# Or run directly with Node.js
node index.js
```

The server will start on port 3000 by default.

## API Endpoints

### Base URL

```
http://localhost:3000
```

### Core Endpoints

#### 1. Trigger Asset Sync

**Endpoint:** `POST /trigger`

**Description:** Initiates asset synchronization process with AI processing capabilities.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token> (optional)
```

**Request Body:**
```json
{
  "input": "string",
  "options": {
    "syncMode": "full|incremental",
    "priority": "low|normal|high",
    "callbackUrl": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "uuid-string",
  "status": "queued|processing|completed|failed",
  "message": "Asset sync initiated successfully",
  "estimatedTime": "5-10 minutes"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO", "options": {"syncMode": "full", "priority": "normal"}}'
```

#### 2. Get Sync Status

**Endpoint:** `GET /status/:jobId`

**Description:** Retrieves the current status of a sync job.

**Parameters:**
- `jobId` (string, required): The unique identifier of the sync job

**Response:**
```json
{
  "jobId": "uuid-string",
  "status": "queued|processing|completed|failed",
  "progress": 75,
  "startedAt": "2024-01-01T10:00:00Z",
  "completedAt": "2024-01-01T10:05:00Z",
  "result": {
    "assetsProcessed": 150,
    "errors": 0,
    "warnings": 2
  }
}
```

#### 3. PayPal Payment Processing

**Endpoint:** `POST /payments/create`

**Description:** Creates a new PayPal payment for asset processing.

**Request Body:**
```json
{
  "amount": {
    "total": "10.00",
    "currency": "USD"
  },
  "description": "Asset sync processing fee",
  "returnUrl": "https://yourapp.com/success",
  "cancelUrl": "https://yourapp.com/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "PAY-XXXXXXXXXXXX",
  "approvalUrl": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-XXXXXXXXXXXX"
}
```

#### 4. Execute Payment

**Endpoint:** `POST /payments/execute`

**Description:** Executes a PayPal payment after user approval.

**Request Body:**
```json
{
  "paymentId": "PAY-XXXXXXXXXXXX",
  "payerId": "PayerID"
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "TXN-XXXXXXXXXXXX",
  "state": "approved",
  "amount": {
    "total": "10.00",
    "currency": "USD"
  }
}
```

#### 5. Health Check

**Endpoint:** `GET /health`

**Description:** Returns the health status of the service.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T10:00:00Z",
  "version": "1.0.0",
  "uptime": 3600,
  "services": {
    "paypal": "connected",
    "database": "connected",
    "ai_processor": "ready"
  }
}
```

## Authentication

### API Key Authentication

Include your API key in the request headers:

```bash
curl -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  https://api.legendo-sync.com/trigger
```

### PayPal OAuth

For PayPal-specific operations, use PayPal OAuth 2.0:

```bash
curl -H "Authorization: Bearer paypal-access-token" \
  -H "Content-Type: application/json" \
  https://api.legendo-sync.com/payments/create
```

## Request/Response Formats

### Standard Request Format

All API requests should include:

```json
{
  "data": {
    // Request payload
  },
  "metadata": {
    "requestId": "uuid",
    "timestamp": "2024-01-01T10:00:00Z",
    "version": "1.0"
  }
}
```

### Standard Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response payload
  },
  "error": null,
  "metadata": {
    "requestId": "uuid",
    "timestamp": "2024-01-01T10:00:00Z",
    "version": "1.0"
  }
}
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "field": "input",
      "reason": "Input cannot be empty"
    }
  },
  "metadata": {
    "requestId": "uuid",
    "timestamp": "2024-01-01T10:00:00Z"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid request data |
| `AUTHENTICATION_FAILED` | Invalid or missing credentials |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `PAYMENT_FAILED` | PayPal payment processing error |
| `SYNC_JOB_NOT_FOUND` | Invalid job ID |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Free Tier:** 100 requests per hour
- **Pro Tier:** 1,000 requests per hour
- **Enterprise:** 10,000 requests per hour

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Examples

### Complete Asset Sync Workflow

```javascript
// 1. Initiate sync
const syncResponse = await fetch('http://localhost:3000/trigger', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-key'
  },
  body: JSON.stringify({
    input: 'HALO BA LEGENDO',
    options: {
      syncMode: 'full',
      priority: 'normal'
    }
  })
});

const syncData = await syncResponse.json();
console.log('Sync initiated:', syncData.jobId);

// 2. Poll for status
const checkStatus = async (jobId) => {
  const statusResponse = await fetch(`http://localhost:3000/status/${jobId}`);
  const statusData = await statusResponse.json();
  
  if (statusData.status === 'completed') {
    console.log('Sync completed:', statusData.result);
  } else if (statusData.status === 'failed') {
    console.error('Sync failed:', statusData.error);
  } else {
    console.log('Progress:', statusData.progress + '%');
    setTimeout(() => checkStatus(jobId), 5000); // Check again in 5 seconds
  }
};

checkStatus(syncData.jobId);
```

### PayPal Payment Integration

```javascript
// 1. Create payment
const paymentResponse = await fetch('http://localhost:3000/payments/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: {
      total: '10.00',
      currency: 'USD'
    },
    description: 'Asset sync processing fee',
    returnUrl: 'https://yourapp.com/success',
    cancelUrl: 'https://yourapp.com/cancel'
  })
});

const paymentData = await paymentResponse.json();

// 2. Redirect user to PayPal
window.location.href = paymentData.approvalUrl;

// 3. After user returns, execute payment
const executeResponse = await fetch('http://localhost:3000/payments/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    paymentId: paymentData.paymentId,
    payerId: 'PayerID' // Get from PayPal return URL
  })
});

const executeData = await executeResponse.json();
console.log('Payment executed:', executeData.transactionId);
```

## SDK Support

### JavaScript/Node.js

```bash
npm install legendo-sync-sdk
```

```javascript
const LegendoSync = require('legendo-sync-sdk');

const client = new LegendoSync({
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:3000'
});

// Trigger sync
const job = await client.triggerSync({
  input: 'HALO BA LEGENDO',
  options: { syncMode: 'full' }
});

// Check status
const status = await client.getStatus(job.jobId);
```

### Python

```bash
pip install legendo-sync
```

```python
from legendo_sync import LegendoSyncClient

client = LegendoSyncClient(
    api_key='your-api-key',
    base_url='http://localhost:3000'
)

# Trigger sync
job = client.trigger_sync(
    input='HALO BA LEGENDO',
    options={'syncMode': 'full'}
)

# Check status
status = client.get_status(job['jobId'])
```

## Webhooks

LEGENDO SYNC supports webhooks for real-time notifications:

### Webhook Events

- `sync.started` - Sync job started
- `sync.progress` - Sync job progress update
- `sync.completed` - Sync job completed
- `sync.failed` - Sync job failed
- `payment.created` - Payment created
- `payment.completed` - Payment completed
- `payment.failed` - Payment failed

### Webhook Configuration

```json
{
  "url": "https://yourapp.com/webhooks/legendo-sync",
  "events": ["sync.completed", "payment.completed"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload

```json
{
  "event": "sync.completed",
  "data": {
    "jobId": "uuid-string",
    "status": "completed",
    "result": {
      "assetsProcessed": 150,
      "errors": 0
    }
  },
  "timestamp": "2024-01-01T10:00:00Z"
}
```

## Security

### Data Encryption

- All data is encrypted in transit using TLS 1.3
- Sensitive data is encrypted at rest using AES-256
- API keys are hashed using bcrypt

### Security Headers

The API includes security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Input Validation

- All inputs are validated and sanitized
- SQL injection protection
- XSS protection
- Rate limiting per IP and API key

## Monitoring and Logging

### Health Monitoring

The `/health` endpoint provides real-time health status:

```bash
curl http://localhost:3000/health
```

### Logging

All API requests and responses are logged with:

- Request ID for tracing
- Timestamp
- User ID (if authenticated)
- IP address
- Response time
- Error details (if any)

### Metrics

Key metrics tracked:

- Request count per endpoint
- Response times
- Error rates
- Payment success rates
- Sync job completion rates

## Support

For technical support and questions:

- **Documentation:** https://docs.legendo-sync.com
- **GitHub Issues:** https://github.com/HuzoBaz/legendo-sync/issues
- **Email:** support@legendo-sync.com
- **Discord:** https://discord.gg/legendo-sync

## Changelog

### Version 1.0.0
- Initial release
- Basic asset sync functionality
- PayPal payment integration
- REST API endpoints
- Webhook support