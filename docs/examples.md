# Examples

## Start the server

```bash
npm init -y
npm install express paypal-rest-sdk dotenv
node index.js
```

Server will report:

```text
LEGENDO SYNC running on port 3000
```

## Trigger via cURL

```bash
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}'
```
