# LEGENDO SYNC - API Documentation

## Overview

LEGENDO SYNC is a vault-grade AI executor for asset sync and PayPal injection. This service provides a RESTful API for triggering PayPal operations and managing asset synchronization.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Environment Configuration](#environment-configuration)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Formats](#requestresponse-formats)
5. [Error Handling](#error-handling)
6. [Usage Examples](#usage-examples)
7. [Development](#development)

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- PayPal Developer Account

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HuzoBaz/legendo-sync.git
   cd legendo-sync
   ```

2. **Initialize the project:**
   ```bash
   npm init -y
   ```

3. **Install dependencies:**
   ```bash
   npm install express paypal-rest-sdk dotenv
   ```

4. **Configure environment variables:**
   ```bash
   # Create .env file with your PayPal credentials
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   PAYPAL_EMAIL=your_paypal_email@example.com
   ```

5. **Start the service:**
   ```bash
   node index.js
   ```

The service will be running on `http://localhost:3000`

## Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PAYPAL_CLIENT_ID` | PayPal REST API Client ID | `AeA1QIZXiflr1_-LQvLxHx` |
| `PAYPAL_CLIENT_SECRET` | PayPal REST API Client Secret | `ECbVhKtLx` |
| `PAYPAL_EMAIL` | PayPal account email | `merchant@example.com` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

## API Endpoints

### Base URL
```
http://localhost:3000
```

### POST /trigger

Triggers the LEGENDO SYNC operation with the provided input.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "input": "string"
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `input` | string | Yes | Input string to process |

#### Response

**Success Response (200):**
```json
{
  "status": "success",
  "message": "LEGENDO SYNC operation completed",
  "data": {
    "processed_input": "string",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "operation_id": "uuid"
  }
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Invalid input provided",
  "error_code": "INVALID_INPUT"
}
```

**Error Response (500):**
```json
{
  "status": "error",
  "message": "Internal server error",
  "error_code": "INTERNAL_ERROR"
}
```

## Request/Response Formats

### Standard Request Format

All API requests should include:
- `Content-Type: application/json` header
- Valid JSON body
- Required parameters as specified in endpoint documentation

### Standard Response Format

All API responses follow this structure:

```json
{
  "status": "success|error",
  "message": "Human-readable message",
  "data": {}, // Present only on success
  "error_code": "ERROR_CODE" // Present only on error
}
```

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid credentials |
| 500 | Internal Server Error |

### Error Codes

| Error Code | Description |
|------------|-------------|
| `INVALID_INPUT` | The provided input is invalid or malformed |
| `MISSING_CREDENTIALS` | PayPal credentials are not configured |
| `PAYPAL_ERROR` | Error occurred during PayPal operation |
| `INTERNAL_ERROR` | Unexpected server error |

## Usage Examples

### Basic Usage

**Trigger LEGENDO SYNC operation:**
```bash
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}'
```

**Response:**
```json
{
  "status": "success",
  "message": "LEGENDO SYNC operation completed",
  "data": {
    "processed_input": "HALO BA LEGENDO",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "operation_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

async function triggerLegendoSync(input) {
  try {
    const response = await axios.post('http://localhost:3000/trigger', {
      input: input
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
triggerLegendoSync('HALO BA LEGENDO')
  .then(result => console.log('Operation completed:', result))
  .catch(error => console.error('Operation failed:', error));
```

### Python Example

```python
import requests
import json

def trigger_legendo_sync(input_text):
    url = 'http://localhost:3000/trigger'
    headers = {'Content-Type': 'application/json'}
    data = {'input': input_text}
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Error: {e}')
        return None

# Usage
result = trigger_legendo_sync('HALO BA LEGENDO')
if result:
    print('Success:', result)
else:
    print('Operation failed')
```

### cURL Examples

**Basic request:**
```bash
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "Test input"}'
```

**With verbose output:**
```bash
curl -v -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}'
```

## Development

### Project Structure

```
legendo-sync/
├── index.js              # Main application file
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (create this)
├── .gitignore           # Git ignore rules
└── README.md            # Project documentation
```

### Dependencies

- **express**: Web framework for Node.js
- **paypal-rest-sdk**: PayPal REST API SDK
- **dotenv**: Environment variable loader

### Running in Development

1. **Start the development server:**
   ```bash
   node index.js
   ```

2. **Test the API:**
   ```bash
   # Test with curl
   curl -X POST http://localhost:3000/trigger \
     -H "Content-Type: application/json" \
     -d '{"input": "HALO BA LEGENDO"}'
   ```

### Production Deployment

1. **Set production environment variables**
2. **Use a process manager like PM2:**
   ```bash
   npm install -g pm2
   pm2 start index.js --name legendo-sync
   ```

3. **Configure reverse proxy (nginx/Apache) if needed**

## Security Considerations

- Store PayPal credentials securely using environment variables
- Never commit `.env` files to version control
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Validate all input data
- Log all API requests for monitoring

## Monitoring and Logging

- Monitor API response times and error rates
- Log all requests and responses
- Set up alerts for critical errors
- Monitor PayPal API usage and limits

## Support

For issues and questions:
- Check the error codes and messages in responses
- Verify environment configuration
- Ensure PayPal credentials are valid
- Check server logs for detailed error information

---

*This documentation is generated for LEGENDO SYNC v1.0.0*