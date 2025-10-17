# LEGENDO SYNC - Usage Guide

Complete guide for setting up, configuring, and using LEGENDO SYNC.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Server](#running-the-server)
5. [Basic Usage](#basic-usage)
6. [Integration Examples](#integration-examples)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before installing LEGENDO SYNC, ensure you have the following:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **PayPal Developer Account** (for payment integration)
- **Git** (optional, for cloning repository)

---

## Installation

### Method 1: Clone from Repository

```bash
# Clone the repository
git clone https://github.com/HuzoBaz/legendo-sync.git

# Navigate to project directory
cd legendo-sync

# Initialize npm project (if needed)
npm init -y

# Install dependencies
npm install express paypal-rest-sdk dotenv
```

### Method 2: Manual Setup

```bash
# Create project directory
mkdir legendo-sync
cd legendo-sync

# Initialize npm project
npm init -y

# Install dependencies
npm install express paypal-rest-sdk dotenv

# Copy the index.js file to your project
```

### Development Dependencies (Optional)

```bash
# Install development tools
npm install --save-dev nodemon jest supertest

# For linting
npm install --save-dev eslint

# For API testing
npm install --save-dev axios
```

---

## Configuration

### 1. Environment Variables

Create a `.env` file in the project root directory:

```bash
# .env file
# Server Configuration
PORT=3000
NODE_ENV=development

# API Key (Optional - for authentication)
REQUIRE_API_KEY=false
API_KEY=your-secret-api-key-here

# PayPal Configuration
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here

# PayPal Redirect URLs
PAYPAL_RETURN_URL=http://localhost:3000/success
PAYPAL_CANCEL_URL=http://localhost:3000/cancel

# Optional: PayPal Email
PAYPAL_EMAIL=your_paypal_email@example.com
```

### 2. Get PayPal Credentials

#### Step 1: Create PayPal Developer Account

1. Visit [PayPal Developer Portal](https://developer.paypal.com/)
2. Sign in or create a new account
3. Navigate to **Dashboard**

#### Step 2: Create an App

1. Go to **My Apps & Credentials**
2. Click **Create App** under "REST API apps"
3. Enter app name (e.g., "LEGENDO SYNC")
4. Click **Create App**

#### Step 3: Get Credentials

1. Copy your **Client ID**
2. Copy your **Secret**
3. Use **Sandbox** credentials for testing
4. Use **Live** credentials for production

**Important:** Never commit your `.env` file to version control!

Add to `.gitignore`:
```
.env
node_modules/
```

---

## Running the Server

### Development Mode

```bash
# Standard node
node index.js

# With nodemon (auto-restart on changes)
npx nodemon index.js
```

### Production Mode

```bash
# Set environment to production
NODE_ENV=production node index.js

# Or use PM2 for process management
npm install -g pm2
pm2 start index.js --name legendo-sync
```

### Verify Server is Running

```bash
# Check health endpoint
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "LEGENDO SYNC",
  "timestamp": "2025-10-17T12:00:00.000Z",
  "uptime": 5.234
}
```

---

## Basic Usage

### 1. Asset Synchronization

#### Trigger a Sync

```bash
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}'
```

Response:
```json
{
  "status": "success",
  "message": "Asset sync completed",
  "input": "HALO BA LEGENDO",
  "syncId": "SYNC-1729166400000",
  "timestamp": "2025-10-17T12:00:00.000Z"
}
```

#### Check Sync Status

```bash
curl http://localhost:3000/sync/SYNC-1729166400000
```

Response:
```json
{
  "syncId": "SYNC-1729166400000",
  "status": "completed",
  "timestamp": "2025-10-17T12:00:00.000Z"
}
```

### 2. PayPal Payment Processing

#### Complete Payment Flow

**Step 1: Create Payment**

```bash
curl -X POST http://localhost:3000/payment/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "currency": "USD",
    "description": "Test Payment"
  }'
```

Response:
```json
{
  "paymentId": "PAYID-M123456",
  "approvalUrl": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-xxxxx",
  "status": "created",
  "amount": 10.00,
  "currency": "USD"
}
```

**Step 2: User Approval**

1. Redirect user to the `approvalUrl`
2. User logs into PayPal and approves payment
3. PayPal redirects back to your `PAYPAL_RETURN_URL` with query parameters

**Step 3: Execute Payment**

```bash
curl -X POST http://localhost:3000/payment/execute \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "PAYID-M123456",
    "payerId": "ABCD1234"
  }'
```

Response:
```json
{
  "status": "success",
  "paymentId": "PAYID-M123456",
  "state": "approved",
  "payer": {...},
  "transactions": [...]
}
```

---

## Integration Examples

### Web Application Integration (HTML + JavaScript)

```html
<!DOCTYPE html>
<html>
<head>
  <title>LEGENDO SYNC Integration</title>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>
<body>
  <h1>LEGENDO SYNC Demo</h1>
  
  <!-- Asset Sync Section -->
  <div>
    <h2>Asset Sync</h2>
    <input type="text" id="syncInput" placeholder="Enter sync data" />
    <button onclick="triggerSync()">Trigger Sync</button>
    <div id="syncResult"></div>
  </div>
  
  <!-- Payment Section -->
  <div>
    <h2>Create Payment</h2>
    <input type="number" id="amount" placeholder="Amount" value="10.00" />
    <button onclick="createPayment()">Create Payment</button>
    <div id="paymentResult"></div>
  </div>

  <script>
    const BASE_URL = 'http://localhost:3000';
    const API_KEY = 'your-api-key'; // If required

    async function triggerSync() {
      const input = document.getElementById('syncInput').value;
      
      try {
        const response = await axios.post(`${BASE_URL}/trigger`, {
          input: input
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          }
        });
        
        document.getElementById('syncResult').innerHTML = 
          `<pre>${JSON.stringify(response.data, null, 2)}</pre>`;
      } catch (error) {
        console.error('Error:', error);
        document.getElementById('syncResult').innerHTML = 
          `<p style="color: red;">Error: ${error.response?.data?.message || error.message}</p>`;
      }
    }

    async function createPayment() {
      const amount = parseFloat(document.getElementById('amount').value);
      
      try {
        const response = await axios.post(`${BASE_URL}/payment/create`, {
          amount: amount,
          currency: 'USD',
          description: 'Web Payment'
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          }
        });
        
        const approvalUrl = response.data.approvalUrl;
        
        document.getElementById('paymentResult').innerHTML = 
          `<p>Payment created! <a href="${approvalUrl}" target="_blank">Approve Payment</a></p>`;
        
        // Optionally redirect automatically
        // window.location.href = approvalUrl;
      } catch (error) {
        console.error('Error:', error);
        document.getElementById('paymentResult').innerHTML = 
          `<p style="color: red;">Error: ${error.response?.data?.message || error.message}</p>`;
      }
    }
  </script>
</body>
</html>
```

### Node.js/Express Integration

```javascript
// app.js - Your Express application
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const LEGENDO_SYNC_URL = 'http://localhost:3000';
const LEGENDO_API_KEY = 'your-api-key';

// Integrate asset sync into your application
app.post('/my-app/sync', async (req, res) => {
  try {
    const response = await axios.post(
      `${LEGENDO_SYNC_URL}/trigger`,
      { input: req.body.data },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': LEGENDO_API_KEY
        }
      }
    );
    
    res.json({
      success: true,
      syncId: response.data.syncId,
      message: 'Sync initiated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// Integrate payment processing
app.post('/my-app/checkout', async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    const response = await axios.post(
      `${LEGENDO_SYNC_URL}/payment/create`,
      {
        amount: amount,
        currency: 'USD',
        description: description
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': LEGENDO_API_KEY
        }
      }
    );
    
    res.json({
      success: true,
      paymentId: response.data.paymentId,
      approvalUrl: response.data.approvalUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// Handle PayPal callback
app.get('/my-app/payment/complete', async (req, res) => {
  try {
    const { paymentId, PayerID } = req.query;
    
    const response = await axios.post(
      `${LEGENDO_SYNC_URL}/payment/execute`,
      {
        paymentId: paymentId,
        payerId: PayerID
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': LEGENDO_API_KEY
        }
      }
    );
    
    res.send('<h1>Payment Successful!</h1><p>Thank you for your payment.</p>');
  } catch (error) {
    res.status(500).send('<h1>Payment Failed</h1><p>Please try again.</p>');
  }
});

app.listen(4000, () => {
  console.log('My app running on port 4000');
});
```

### React Integration

```jsx
// PaymentComponent.jsx
import React, { useState } from 'react';
import axios from 'axios';

const PaymentComponent = () => {
  const [amount, setAmount] = useState(10.00);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:3000/payment/create',
        {
          amount: amount,
          currency: 'USD',
          description: 'React App Payment'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'your-api-key'
          }
        }
      );

      // Redirect to PayPal
      window.location.href = response.data.approvalUrl;
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <h2>Make a Payment</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(parseFloat(e.target.value))}
        placeholder="Amount"
      />
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : 'Pay with PayPal'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default PaymentComponent;
```

---

## Testing

### Manual Testing

```bash
# Test health check
curl http://localhost:3000/health

# Test asset sync
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "test data"}'

# Test payment creation
curl -X POST http://localhost:3000/payment/create \
  -H "Content-Type: application/json" \
  -d '{"amount": 5.00, "currency": "USD"}'
```

### Automated Testing with Jest

Create `tests/api.test.js`:

```javascript
const request = require('supertest');
const { app } = require('../index');

describe('LEGENDO SYNC API Tests', () => {
  
  test('Health check should return 200', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('healthy');
  });

  test('Trigger sync should return success', async () => {
    const response = await request(app)
      .post('/trigger')
      .send({ input: 'test' });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.syncId).toBeDefined();
  });

  test('Create payment should require amount', async () => {
    const response = await request(app)
      .post('/payment/create')
      .send({});
    
    expect(response.statusCode).toBe(400);
  });
});
```

Run tests:
```bash
npm test
```

---

## Deployment

### Deploy to Production Server

```bash
# 1. Install on server
ssh user@your-server.com
git clone https://github.com/HuzoBaz/legendo-sync.git
cd legendo-sync
npm install --production

# 2. Configure environment
nano .env
# Set production values

# 3. Start with PM2
npm install -g pm2
pm2 start index.js --name legendo-sync
pm2 save
pm2 startup
```

### Deploy with Docker

Create `Dockerfile`:

```dockerfile
FROM node:14

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  legendo-sync:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
```

Run with Docker:
```bash
docker-compose up -d
```

### Deploy to Cloud Platforms

#### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create legendo-sync

# Set environment variables
heroku config:set PAYPAL_CLIENT_ID=your_client_id
heroku config:set PAYPAL_CLIENT_SECRET=your_secret

# Deploy
git push heroku main

# Open app
heroku open
```

#### AWS EC2

1. Launch EC2 instance (Ubuntu/Amazon Linux)
2. Install Node.js
3. Clone repository
4. Install dependencies
5. Configure environment variables
6. Use PM2 or systemd for process management
7. Configure security groups to allow port 3000

---

## Troubleshooting

### Common Issues

#### Issue: "Cannot find module 'dotenv'"

**Solution:**
```bash
npm install dotenv
```

#### Issue: "PayPal API error: Invalid credentials"

**Solution:**
- Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` in `.env`
- Ensure you're using correct mode (sandbox vs. live)
- Check credentials in PayPal Developer Dashboard

#### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 node index.js
```

#### Issue: "Request timeout"

**Solution:**
- Check if server is running
- Verify firewall settings
- Check network connectivity
- Increase timeout in client code

### Debug Mode

Enable detailed logging:
```bash
DEBUG=* node index.js
```

### Check Logs

```bash
# With PM2
pm2 logs legendo-sync

# View error logs
pm2 logs legendo-sync --err

# Standard output
node index.js 2>&1 | tee app.log
```

---

## Best Practices

1. **Security**
   - Never commit `.env` file
   - Use strong API keys
   - Enable HTTPS in production
   - Validate all inputs
   - Use environment-specific credentials

2. **Performance**
   - Implement caching for frequent requests
   - Use connection pooling
   - Monitor server resources
   - Implement rate limiting

3. **Monitoring**
   - Set up error tracking (e.g., Sentry)
   - Monitor uptime
   - Track API response times
   - Log all transactions

4. **Maintenance**
   - Keep dependencies updated
   - Regular security audits
   - Backup configuration
   - Document changes

---

## Additional Resources

- [PayPal REST API Documentation](https://developer.paypal.com/docs/api/overview/)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## Support

For issues or questions:
- Check server logs
- Review PayPal sandbox dashboard
- Verify environment configuration
- Test with curl commands first

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-17
