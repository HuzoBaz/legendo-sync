# LEGENDO SYNC API Documentation

## Overview

LEGENDO SYNC is a vault-grade AI executor for asset synchronization and PayPal payment processing. This document provides comprehensive documentation for all public APIs, functions, and components.

## Table of Contents

- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
- [Core Classes](#core-classes)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Authentication

Currently, LEGENDO SYNC uses IP-based rate limiting. Future versions will include API key authentication.

## Rate Limiting

- **Limit**: 10 requests per minute per IP address
- **Response**: HTTP 429 when limit exceeded
- **Headers**: Rate limit information included in response headers

## API Endpoints

### Health Check

**GET** `/health`

Returns the current health status of the LEGENDO SYNC service.

#### Response

```json
{
  "status": "healthy",
  "service": "LEGENDO SYNC",
  "version": "1.0.0",
  "activeSessions": 0,
  "cachedAssets": 0,
  "uptime": 123.456,
  "memoryUsage": {
    "rss": 12345678,
    "heapTotal": 8765432,
    "heapUsed": 4567890,
    "external": 1234567,
    "arrayBuffers": 123456
  },
  "securityLevel": "vault-grade",
  "lastHealthCheck": "2023-10-17T10:30:00.000Z"
}
```

#### Example

```bash
curl -X GET http://localhost:3000/health
```

---

### AI Execution Trigger

**POST** `/trigger`

Executes AI commands with vault-grade security and returns processed results.

#### Request Body

```json
{
  "input": "string (required) - Command or data to process",
  "options": {
    "sessionId": "string (optional) - Custom session identifier",
    "assets": "array (optional) - Assets for SYNC_ASSETS command",
    "paypalData": "object (optional) - PayPal data for PAYPAL_INJECT command"
  }
}
```

#### Response

```json
{
  "sessionId": "uuid",
  "timestamp": "2023-10-17T10:30:00.000Z",
  "status": "success|error",
  "result": "object - Command execution result",
  "metadata": {
    "processingTime": 123,
    "inputLength": 15
  }
}
```

#### Supported Commands

- `HALO BA LEGENDO` - Activates LEGENDO SYNC
- `SYNC_ASSETS` - Synchronizes assets (requires assets in options)
- `PAYPAL_INJECT` - Activates PayPal capabilities
- `VAULT_STATUS` - Returns vault security status
- `HEALTH_CHECK` - Returns health information

#### Examples

```bash
# Basic activation
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}'

# Asset synchronization
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "input": "SYNC_ASSETS",
    "options": {
      "assets": [
        {"id": "asset1", "type": "document", "data": "..."},
        {"id": "asset2", "type": "image", "data": "..."}
      ]
    }
  }'

# Custom command with session ID
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Custom AI command",
    "options": {
      "sessionId": "my-custom-session-123"
    }
  }'
```

---

### Asset Synchronization

**POST** `/sync`

Synchronizes assets with vault-grade encryption and security.

#### Request Body

```json
{
  "assets": [
    {
      "id": "string - Asset identifier",
      "type": "string - Asset type",
      "data": "any - Asset data",
      "metadata": "object (optional) - Additional metadata"
    }
  ]
}
```

#### Response

```json
{
  "status": "success",
  "totalAssets": 2,
  "syncedAssets": 2,
  "failedAssets": 0,
  "results": [
    {
      "assetId": "uuid",
      "status": "synced",
      "hash": "sha256-hash"
    }
  ]
}
```

#### Example

```bash
curl -X POST http://localhost:3000/sync \
  -H "Content-Type: application/json" \
  -d '{
    "assets": [
      {
        "id": "doc-001",
        "type": "document",
        "data": {"title": "Important Document", "content": "..."},
        "metadata": {"priority": "high"}
      },
      {
        "id": "img-001",
        "type": "image",
        "data": "base64-encoded-image-data",
        "metadata": {"format": "png", "size": "1920x1080"}
      }
    ]
  }'
```

---

### PayPal Payment Creation

**POST** `/paypal/create`

Creates a new PayPal payment with the specified configuration.

#### Request Body

```json
{
  "items": [
    {
      "name": "string - Item name",
      "sku": "string - Item SKU",
      "price": "string - Item price",
      "currency": "string - Currency code",
      "quantity": "number - Quantity"
    }
  ],
  "total": "string - Total amount",
  "currency": "string - Currency code (default: USD)",
  "description": "string - Payment description",
  "returnUrl": "string - Success redirect URL",
  "cancelUrl": "string - Cancel redirect URL"
}
```

#### Response

```json
{
  "paymentId": "PAY-1234567890",
  "approvalUrl": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=...",
  "status": "created"
}
```

#### Example

```bash
curl -X POST http://localhost:3000/paypal/create \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "name": "LEGENDO Premium Service",
        "sku": "LEG-PREM-001",
        "price": "29.99",
        "currency": "USD",
        "quantity": 1
      }
    ],
    "total": "29.99",
    "currency": "USD",
    "description": "LEGENDO SYNC Premium Service Subscription",
    "returnUrl": "https://myapp.com/success",
    "cancelUrl": "https://myapp.com/cancel"
  }'
```

---

### PayPal Payment Execution

**POST** `/paypal/execute`

Executes a previously created PayPal payment after user approval.

#### Request Body

```json
{
  "paymentId": "string (required) - PayPal payment ID",
  "payerId": "string (required) - PayPal payer ID"
}
```

#### Response

```json
{
  "paymentId": "PAY-1234567890",
  "state": "approved",
  "status": "executed"
}
```

#### Example

```bash
curl -X POST http://localhost:3000/paypal/execute \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "PAY-1234567890",
    "payerId": "PAYER123456789"
  }'
```

---

### Session Retrieval

**GET** `/session/:sessionId`

Retrieves session data by session identifier.

#### Parameters

- `sessionId` (path parameter) - Session identifier

#### Response

```json
{
  "input": "Original input command",
  "result": "Command execution result",
  "timestamp": "2023-10-17T10:30:00.000Z",
  "options": "Original options object"
}
```

#### Example

```bash
curl -X GET http://localhost:3000/session/550e8400-e29b-41d4-a716-446655440000
```

---

### Vault Status

**GET** `/vault/status`

Returns detailed vault security status and metrics.

#### Response

```json
{
  "status": "secure",
  "activeSessions": 5,
  "cachedAssets": 12,
  "uptime": 3600.123,
  "memoryUsage": {
    "rss": 12345678,
    "heapTotal": 8765432,
    "heapUsed": 4567890,
    "external": 1234567,
    "arrayBuffers": 123456
  },
  "securityLevel": "vault-grade",
  "lastHealthCheck": "2023-10-17T10:30:00.000Z"
}
```

#### Example

```bash
curl -X GET http://localhost:3000/vault/status
```

## Core Classes

### LegendoSync

The main class that handles AI execution, asset synchronization, and PayPal integration.

#### Constructor

```javascript
const legendoSync = new LegendoSync();
```

#### Methods

##### `executeAI(input, options)`

Processes AI execution requests with vault-grade security.

**Parameters:**
- `input` (string) - Input command or data
- `options` (object) - Execution options
  - `sessionId` (string, optional) - Custom session identifier
  - `assets` (array, optional) - Assets for synchronization
  - `paypalData` (object, optional) - PayPal configuration data

**Returns:** Promise<object> - Execution result

**Example:**
```javascript
const result = await legendoSync.executeAI('HALO BA LEGENDO', {
  sessionId: 'custom-session-123'
});
console.log(result);
```

##### `syncAssets(assets)`

Synchronizes assets with vault-grade security.

**Parameters:**
- `assets` (array) - Array of asset objects to sync

**Returns:** Promise<object> - Sync result

**Example:**
```javascript
const assets = [
  { id: 'doc1', type: 'document', data: { title: 'Test' } }
];
const result = await legendoSync.syncAssets(assets);
console.log(result);
```

##### `injectPayPal(paypalData)`

Injects PayPal payment processing capabilities.

**Parameters:**
- `paypalData` (object) - PayPal configuration and payment data

**Returns:** Promise<object> - Injection result

**Example:**
```javascript
const paypalData = {
  createPayment: {
    items: [{ name: 'Service', price: '10.00', currency: 'USD', quantity: 1 }],
    total: '10.00'
  }
};
const result = await legendoSync.injectPayPal(paypalData);
console.log(result);
```

##### `encrypt(text)`

Encrypts sensitive data using AES-256-GCM.

**Parameters:**
- `text` (string) - Text to encrypt

**Returns:** object - Encrypted data with IV and auth tag

**Example:**
```javascript
const encrypted = legendoSync.encrypt('sensitive data');
console.log(encrypted);
// { encrypted: '...', iv: '...', authTag: '...' }
```

##### `decrypt(encryptedData)`

Decrypts data encrypted with the encrypt method.

**Parameters:**
- `encryptedData` (object) - Object containing encrypted data, IV, and auth tag

**Returns:** string - Decrypted text

**Example:**
```javascript
const decrypted = legendoSync.decrypt(encryptedData);
console.log(decrypted);
```

##### `getVaultStatus()`

Gets current vault status and security metrics.

**Returns:** object - Vault status information

**Example:**
```javascript
const status = legendoSync.getVaultStatus();
console.log(status);
```

##### `getSession(sessionId)`

Retrieves session data by ID.

**Parameters:**
- `sessionId` (string) - Session identifier

**Returns:** object|null - Session data or null if not found

**Example:**
```javascript
const session = legendoSync.getSession('session-123');
if (session) {
  console.log('Session found:', session);
}
```

##### `cleanup(maxAge)`

Clears expired sessions and cached assets.

**Parameters:**
- `maxAge` (number, optional) - Maximum age in milliseconds (default: 1 hour)

**Example:**
```javascript
// Clean up sessions older than 30 minutes
legendoSync.cleanup(30 * 60 * 1000);
```

## Error Handling

### Error Response Format

All API endpoints return errors in a consistent format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error description",
  "code": "ERROR_CODE (optional)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Error Types

- **Validation Errors** - Invalid input parameters
- **Rate Limit Errors** - Too many requests
- **PayPal Errors** - Payment processing failures
- **Session Errors** - Session not found or expired
- **Encryption Errors** - Data encryption/decryption failures

## Security Features

### Vault-Grade Security

- **AES-256-GCM Encryption** - All sensitive data encrypted
- **Session Management** - Secure session handling with UUIDs
- **Rate Limiting** - Protection against abuse
- **Input Validation** - All inputs validated and sanitized
- **Secure Headers** - Helmet.js security headers
- **CORS Protection** - Configurable CORS policies

### Best Practices

1. **Always use HTTPS** in production
2. **Configure environment variables** properly
3. **Monitor rate limits** and adjust as needed
4. **Regularly rotate encryption keys**
5. **Implement proper logging** and monitoring
6. **Use strong PayPal credentials**
7. **Validate all inputs** on client side as well

## Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# PayPal Configuration
PAYPAL_MODE=sandbox  # or 'live' for production
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_EMAIL=your_paypal_email

# Security Configuration
ENCRYPTION_KEY=your_32_byte_encryption_key
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Logging Configuration
LOG_LEVEL=info
```

## Performance Considerations

### Caching

- **Session Cache** - In-memory session storage
- **Asset Cache** - Encrypted asset caching
- **Automatic Cleanup** - Expired data removal

### Monitoring

- **Winston Logging** - Comprehensive logging system
- **Memory Usage** - Real-time memory monitoring
- **Performance Metrics** - Processing time tracking

### Scalability

- **Stateless Design** - Easy horizontal scaling
- **Rate Limiting** - Built-in protection
- **Graceful Shutdown** - Proper cleanup on termination