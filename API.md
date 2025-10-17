# LEGENDO SYNC - API Documentation

## Overview

LEGENDO SYNC is a vault-grade AI executor for asset synchronization and PayPal payment integration. This document provides comprehensive documentation for all public APIs, including request/response formats, authentication, and usage examples.

**Base URL:** `http://localhost:3000`

**Version:** 1.0.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
   - [Health Check](#health-check)
   - [Asset Synchronization](#asset-synchronization)
   - [PayPal Payment Integration](#paypal-payment-integration)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Examples](#examples)

---

## Authentication

### API Key Authentication (Optional)

If `REQUIRE_API_KEY` is set to `true` in your environment variables, all API requests must include an API key in the request headers.

**Header:**
```
X-API-Key: your-api-key-here
```

**Example:**
```bash
curl -X GET http://localhost:3000/health \
  -H "X-API-Key: your-api-key-here"
```

---

## API Endpoints

### Health Check

Check the health status of the LEGENDO SYNC service.

**Endpoint:** `GET /health`

**Authentication:** Not required

**Response:**
```json
{
  "status": "healthy",
  "service": "LEGENDO SYNC",
  "timestamp": "2025-10-17T12:00:00.000Z",
  "uptime": 3600
}
```

**Status Codes:**
- `200 OK` - Service is healthy

**Example:**
```bash
curl -X GET http://localhost:3000/health
```

---

### Asset Synchronization

#### 1. Trigger Asset Sync

Initiate an asset synchronization operation.

**Endpoint:** `POST /trigger`

**Authentication:** Optional (based on configuration)

**Request Body:**
```json
{
  "input": "string (required)"
}
```

**Parameters:**
| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| input     | string | Yes      | Input data for sync operation  |

**Response:**
```json
{
  "status": "success",
  "message": "Asset sync completed",
  "input": "HALO BA LEGENDO",
  "syncId": "SYNC-1729166400000",
  "timestamp": "2025-10-17T12:00:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Sync initiated successfully
- `400 Bad Request` - Missing or invalid input parameter
- `401 Unauthorized` - Missing or invalid API key
- `500 Internal Server Error` - Server error

**Example:**
```bash
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "input": "HALO BA LEGENDO"
  }'
```

**Response Example:**
```json
{
  "status": "success",
  "message": "Asset sync completed",
  "input": "HALO BA LEGENDO",
  "syncId": "SYNC-1729166400000",
  "timestamp": "2025-10-17T12:00:00.000Z"
}
```

---

#### 2. Get Sync Status

Retrieve the status of a synchronization operation.

**Endpoint:** `GET /sync/:syncId`

**Authentication:** Optional (based on configuration)

**URL Parameters:**
| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| syncId    | string | Yes      | Sync ID returned from trigger  |

**Response:**
```json
{
  "syncId": "SYNC-1729166400000",
  "status": "completed",
  "timestamp": "2025-10-17T12:00:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Status retrieved successfully
- `401 Unauthorized` - Missing or invalid API key
- `404 Not Found` - Sync ID not found

**Example:**
```bash
curl -X GET http://localhost:3000/sync/SYNC-1729166400000 \
  -H "X-API-Key: your-api-key"
```

---

### PayPal Payment Integration

#### 1. Create Payment

Create a new PayPal payment for processing.

**Endpoint:** `POST /payment/create`

**Authentication:** Optional (based on configuration)

**Request Body:**
```json
{
  "amount": 10.00,
  "currency": "USD",
  "description": "Asset Sync Service"
}
```

**Parameters:**
| Parameter   | Type   | Required | Default              | Description                    |
|-------------|--------|----------|----------------------|--------------------------------|
| amount      | number | Yes      | -                    | Payment amount (must be > 0)   |
| currency    | string | No       | USD                  | Currency code (ISO 4217)       |
| description | string | No       | LEGENDO SYNC Payment | Payment description            |

**Response:**
```json
{
  "paymentId": "PAYID-M123456",
  "approvalUrl": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-xxxxx",
  "status": "created",
  "amount": 10.00,
  "currency": "USD"
}
```

**Status Codes:**
- `200 OK` - Payment created successfully
- `400 Bad Request` - Invalid amount or parameters
- `401 Unauthorized` - Missing or invalid API key
- `500 Internal Server Error` - PayPal API error

**Example:**
```bash
curl -X POST http://localhost:3000/payment/create \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "amount": 25.99,
    "currency": "USD",
    "description": "Premium Asset Sync Service"
  }'
```

**Response Example:**
```json
{
  "paymentId": "PAYID-M234567",
  "approvalUrl": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-12ABC34DEF56GHI78",
  "status": "created",
  "amount": 25.99,
  "currency": "USD"
}
```

**Workflow:**
1. Call this endpoint to create a payment
2. Redirect user to the `approvalUrl` to complete payment via PayPal
3. User approves payment on PayPal
4. PayPal redirects to your success URL with `paymentId` and `PayerID`
5. Call `/payment/execute` to finalize the payment

---

#### 2. Execute Payment

Execute (finalize) a PayPal payment after user approval.

**Endpoint:** `POST /payment/execute`

**Authentication:** Optional (based on configuration)

**Request Body:**
```json
{
  "paymentId": "PAYID-M123456",
  "payerId": "PAYERID123ABC"
}
```

**Parameters:**
| Parameter  | Type   | Required | Description                              |
|------------|--------|----------|------------------------------------------|
| paymentId  | string | Yes      | Payment ID from PayPal (from create)     |
| payerId    | string | Yes      | Payer ID from PayPal redirect callback   |

**Response:**
```json
{
  "status": "success",
  "paymentId": "PAYID-M123456",
  "state": "approved",
  "payer": {
    "payment_method": "paypal",
    "status": "VERIFIED",
    "payer_info": {
      "email": "buyer@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "payer_id": "PAYERID123ABC"
    }
  },
  "transactions": [
    {
      "amount": {
        "total": "10.00",
        "currency": "USD"
      },
      "description": "LEGENDO SYNC Payment"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Payment executed successfully
- `400 Bad Request` - Missing paymentId or payerId
- `401 Unauthorized` - Missing or invalid API key
- `500 Internal Server Error` - Payment execution failed

**Example:**
```bash
curl -X POST http://localhost:3000/payment/execute \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "paymentId": "PAYID-M234567",
    "payerId": "ABCD1234EFGH"
  }'
```

---

#### 3. Get Payment Details

Retrieve details of a specific payment.

**Endpoint:** `GET /payment/:paymentId`

**Authentication:** Optional (based on configuration)

**URL Parameters:**
| Parameter  | Type   | Required | Description          |
|------------|--------|----------|----------------------|
| paymentId  | string | Yes      | Payment ID to query  |

**Response:**
```json
{
  "id": "PAYID-M123456",
  "intent": "sale",
  "state": "approved",
  "payer": {
    "payment_method": "paypal",
    "payer_info": {
      "email": "buyer@example.com"
    }
  },
  "transactions": [
    {
      "amount": {
        "total": "10.00",
        "currency": "USD"
      }
    }
  ],
  "create_time": "2025-10-17T12:00:00Z",
  "update_time": "2025-10-17T12:05:00Z"
}
```

**Status Codes:**
- `200 OK` - Payment details retrieved
- `401 Unauthorized` - Missing or invalid API key
- `404 Not Found` - Payment not found
- `500 Internal Server Error` - PayPal API error

**Example:**
```bash
curl -X GET http://localhost:3000/payment/PAYID-M234567 \
  -H "X-API-Key: your-api-key"
```

---

#### 4. Payment Success Callback

Callback endpoint for successful payment redirects from PayPal.

**Endpoint:** `GET /success`

**Authentication:** Not required

**Query Parameters:**
| Parameter  | Type   | Description                    |
|------------|--------|--------------------------------|
| paymentId  | string | Payment ID from PayPal         |
| PayerID    | string | Payer ID from PayPal           |

**Response:**
```json
{
  "message": "Payment successful",
  "paymentId": "PAYID-M123456",
  "payerId": "ABCD1234",
  "instructions": "Use POST /payment/execute to complete the payment"
}
```

**Example:**
```
http://localhost:3000/success?paymentId=PAYID-M123456&PayerID=ABCD1234
```

---

#### 5. Payment Cancel Callback

Callback endpoint when payment is cancelled by user.

**Endpoint:** `GET /cancel`

**Authentication:** Not required

**Response:**
```json
{
  "message": "Payment cancelled",
  "timestamp": "2025-10-17T12:00:00.000Z"
}
```

**Example:**
```
http://localhost:3000/cancel
```

---

## Error Handling

All API errors follow a consistent format:

**Error Response Format:**
```json
{
  "error": "Error type or message",
  "message": "Detailed error description",
  "timestamp": "2025-10-17T12:00:00.000Z"
}
```

### Common HTTP Status Codes

| Status Code | Description                                      |
|-------------|--------------------------------------------------|
| 200         | Success                                          |
| 400         | Bad Request - Invalid input parameters           |
| 401         | Unauthorized - Missing or invalid API key        |
| 404         | Not Found - Resource not found                   |
| 500         | Internal Server Error - Server-side error        |

### Example Error Response

```json
{
  "error": "Bad Request",
  "message": "Input parameter is required",
  "timestamp": "2025-10-17T12:00:00.000Z"
}
```

---

## Rate Limiting

Currently, LEGENDO SYNC does not implement rate limiting. For production deployments, it is recommended to:

1. Implement rate limiting middleware (e.g., `express-rate-limit`)
2. Set appropriate limits based on your use case
3. Return `429 Too Many Requests` when limits are exceeded

**Recommended configuration:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

---

## Examples

### Complete Payment Flow Example

```bash
# Step 1: Create a payment
PAYMENT_RESPONSE=$(curl -s -X POST http://localhost:3000/payment/create \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "amount": 10.00,
    "currency": "USD",
    "description": "Test Payment"
  }')

# Extract payment ID and approval URL
PAYMENT_ID=$(echo $PAYMENT_RESPONSE | jq -r '.paymentId')
APPROVAL_URL=$(echo $PAYMENT_RESPONSE | jq -r '.approvalUrl')

echo "Payment ID: $PAYMENT_ID"
echo "Approval URL: $APPROVAL_URL"

# Step 2: User visits approval URL and approves payment
# PayPal redirects to: http://localhost:3000/success?paymentId=PAYID-XXX&PayerID=YYY

# Step 3: Execute the payment
curl -X POST http://localhost:3000/payment/execute \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d "{
    \"paymentId\": \"$PAYMENT_ID\",
    \"payerId\": \"PAYER123\"
  }"
```

### Asset Sync Example

```bash
# Trigger asset synchronization
SYNC_RESPONSE=$(curl -s -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "input": "HALO BA LEGENDO"
  }')

# Extract sync ID
SYNC_ID=$(echo $SYNC_RESPONSE | jq -r '.syncId')

echo "Sync ID: $SYNC_ID"

# Check sync status
curl -X GET http://localhost:3000/sync/$SYNC_ID \
  -H "X-API-Key: your-api-key"
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_KEY = 'your-api-key';

// Create payment
async function createPayment(amount, currency = 'USD') {
  try {
    const response = await axios.post(
      `${BASE_URL}/payment/create`,
      {
        amount: amount,
        currency: currency,
        description: 'My Payment'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      }
    );
    
    console.log('Payment created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Payment creation failed:', error.response.data);
  }
}

// Trigger asset sync
async function triggerSync(input) {
  try {
    const response = await axios.post(
      `${BASE_URL}/trigger`,
      { input: input },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      }
    );
    
    console.log('Sync triggered:', response.data);
    return response.data;
  } catch (error) {
    console.error('Sync failed:', error.response.data);
  }
}

// Usage
(async () => {
  await createPayment(25.99, 'USD');
  await triggerSync('HALO BA LEGENDO');
})();
```

### Python Example

```python
import requests
import json

BASE_URL = 'http://localhost:3000'
API_KEY = 'your-api-key'

headers = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
}

# Create payment
def create_payment(amount, currency='USD'):
    payload = {
        'amount': amount,
        'currency': currency,
        'description': 'My Payment'
    }
    
    response = requests.post(
        f'{BASE_URL}/payment/create',
        headers=headers,
        json=payload
    )
    
    if response.status_code == 200:
        print('Payment created:', response.json())
        return response.json()
    else:
        print('Error:', response.json())

# Trigger asset sync
def trigger_sync(input_data):
    payload = {'input': input_data}
    
    response = requests.post(
        f'{BASE_URL}/trigger',
        headers=headers,
        json=payload
    )
    
    if response.status_code == 200:
        print('Sync triggered:', response.json())
        return response.json()
    else:
        print('Error:', response.json())

# Usage
if __name__ == '__main__':
    create_payment(25.99, 'USD')
    trigger_sync('HALO BA LEGENDO')
```

---

## Support

For issues or questions:
- Check the logs for detailed error messages
- Ensure all environment variables are properly configured
- Verify PayPal credentials are correct
- Test in sandbox mode before going live

## API Versioning

Current version: **v1.0.0**

Future versions will be announced and may include breaking changes. Always pin to a specific version in production.
