# HTTP Endpoints

## POST /trigger

Triggers a synchronization or action within Legendo Sync.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  - `input` (string): Free-form input message
- **Responses**:
  - `200 OK`: Trigger accepted, returns result payload
  - `4xx/5xx`: Error condition with message

### cURL example

```bash
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}'
```

### Node.js example

```js
import fetch from 'node-fetch';

await fetch('http://localhost:3000/trigger', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: 'HALO BA LEGENDO' })
});
```
