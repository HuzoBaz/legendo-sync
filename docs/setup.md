# Setup and Run

Follow these steps to configure and run Legendo Sync locally.

## 1. Clone and Enter Project
```bash
git clone https://github.com/HuzoBaz/legendo-sync.git
cd legendo-sync
```

## 2. Configure Environment
Use environment variables (recommended) or a `.env` file with `dotenv`.

```bash
export PAYPAL_CLIENT_ID=your_paypal_client_id
export PAYPAL_CLIENT_SECRET=your_paypal_client_secret
export PAYPAL_EMAIL=8limbuzz@gmail.com
export PORT=3000 # optional
```

Example `.env`:
```dotenv
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_EMAIL=8limbuzz@gmail.com
PORT=3000
```

## 3. Install Dependencies
```bash
npm init -y
npm install express paypal-rest-sdk dotenv
```

## 4. Run the Server
```bash
node index.js
```
Console output:
```
LEGENDO SYNC running on port 3000
```

## 5. Test the API
```bash
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}'
```

## 6. Next Steps
- Add `index.js` implementation with Express app and `/trigger`
- Add PayPal configuration using `paypal-rest-sdk`
- Add input validation, logging, and tests
