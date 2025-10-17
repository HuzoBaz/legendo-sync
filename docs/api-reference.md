# API Reference

This reference documents the public HTTP endpoints and expected request/response shapes. The current repository snapshot does not include full route code, but the following reflects the intended surface based on the setup notes.

## Endpoints

### POST /trigger
- **Summary**: Triggers a sync/test action and echoes input
- **Consumes**: `application/json`
- **Produces**: `application/json`
- **Request Body**:
  - `input` (string, required)
- **Responses**:
  - `200 OK`
    - Body: `{ "status": "ok", "echo": string }`
  - `400 Bad Request`
    - Body: `{ "error": "Bad Request", "message": string }`

#### cURL Example
```bash
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}'
```

#### Node Fetch Example
```js
import fetch from 'node-fetch';

const res = await fetch('http://localhost:3000/trigger', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: 'HALO BA LEGENDO' }),
});
const data = await res.json();
console.log(data);
```

---

## Server Lifecycle (suggested)
If you expose a programmatic API, consider exporting:

```ts
/** Starts the Express server and returns the http.Server instance */
export function startServer(options?: { port?: number }): Server;

/** Gracefully stops the running server */
export async function stopServer(server: Server): Promise<void>;
```

Example usage:

```js
const { startServer, stopServer } = require('./index');
const server = startServer({ port: 3000 });
// ... later
await stopServer(server);
```
