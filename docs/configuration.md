# Configuration

Legendo Sync reads the following environment variables:

- `PAYPAL_CLIENT_ID`: Your PayPal REST client id
- `PAYPAL_CLIENT_SECRET`: Your PayPal REST client secret
- `PAYPAL_EMAIL`: PayPal account email used for transactions
- `PORT` (optional): Port for the HTTP server, defaults to `3000`

Example `.env` file:

```env
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_EMAIL=example@example.com
PORT=3000
```

Export variables or use a `.env` file loaded via `dotenv`.
