# legendo-sync

Vault-grade AI executor for asset sync and PayPal injection

## Documentation

See the `docs/` directory:

- [Documentation Index](./docs/index.md)
- [Configuration](./docs/configuration.md)
- [API Reference](./docs/api/README.md)
- [Examples](./docs/examples.md)

## Quickstart

```bash
npm init -y
npm install express paypal-rest-sdk dotenv
node index.js
```

Server will report:

```text
LEGENDO SYNC running on port 3000
```

Trigger with cURL:

```bash
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}'
```
