# Legendo Sync - API and Usage Overview

Legendo Sync is an Express-based service that exposes a simple trigger endpoint and integrates with PayPal via `paypal-rest-sdk`. This documentation summarizes the public API surface and provides setup and usage examples.

## Prerequisites
- Node.js 18+
- NPM
- PayPal REST credentials
  - `PAYPAL_CLIENT_ID`
  - `PAYPAL_CLIENT_SECRET`
  - `PAYPAL_EMAIL`

## Quick Start

```bash
# Clone and enter the project
git clone https://github.com/HuzoBaz/legendo-sync.git
cd legendo-sync

# Configure environment
export PAYPAL_CLIENT_ID=your_paypal_client_id
export PAYPAL_CLIENT_SECRET=your_paypal_client_secret
export PAYPAL_EMAIL=8limbuzz@gmail.com

# Initialize and install
npm init -y
npm install express paypal-rest-sdk dotenv

# Run the server
node index.js
# Server: LEGENDO SYNC running on port 3000
```

## Base URL
- Local: `http://localhost:3000`

## Authorization
- None (development). Secure and authenticate endpoints before production use.

## Error Format
- JSON errors are recommended (shape may vary). Example:

```json
{ "error": "Bad Request", "message": "Missing input" }
```

---

# Public HTTP API

## POST /trigger
Triggers a sync or test action.

- **URL**: `/trigger`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**:
  - `input` (string) – arbitrary input payload

### Request Example
```bash
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}'
```

### Response Example
```json
{ "status": "ok", "echo": "HALO BA LEGENDO" }
```

### Notes
- The exact response shape depends on `index.js` implementation. Ensure you validate and sanitize input.

---

# Node Module API
If used as a module, export a function that starts the server (not currently present in repo). A suggested shape:

```js
// server.js (example)
const { startServer } = require('./index');
startServer({ port: 3000 });
```

```js
// index.js (example idea)
function startServer({ port = 3000 } = {}) {
  const express = require('express');
  const app = express();
  app.use(express.json());
  app.post('/trigger', (req, res) => {
    res.json({ status: 'ok', echo: req.body?.input ?? null });
  });
  return app.listen(port, () => console.log(`LEGENDO SYNC running on port ${port}`));
}
module.exports = { startServer };
```

---

# PayPal Integration
- The project depends on `paypal-rest-sdk`. Typical setup:

```js
const paypal = require('paypal-rest-sdk');
paypal.configure({
  mode: 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});
```

- For payouts or payments, consult the official SDK docs and wire endpoints accordingly.

---

# Environment Variables
- `PAYPAL_CLIENT_ID`: PayPal REST client ID
- `PAYPAL_CLIENT_SECRET`: PayPal REST client secret
- `PAYPAL_EMAIL`: Merchant email associated with PayPal account
- `PORT` (optional): Defaults to `3000`

---

# Development Notes
- Add input validation and error handling for `/trigger`
- Add production-ready logging and metrics
- Secure secrets using `.env` and a secrets manager for deployments
- Consider adding tests for the trigger flow
