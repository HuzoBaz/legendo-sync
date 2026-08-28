# LEGENDO SYNC

**Vault-grade AI executor for asset sync and PayPal injection**

A secure, production-ready PayPal integration service for ForeverFit. Handles payment creation, user redirection, and PayPal business account management.

## Quick Start

### Prerequisites
- Node.js v14+
- PayPal Business Account with API credentials

### Installation & Setup

```bash
# Install dependencies
npm install

# Create and configure .env file
cp .env.example .env
# Edit .env with your PayPal credentials

# Start the service
npm start
```

The service will start on port 3000 and display:
```
LEGENDO SYNC active on port 3000
Connected to PayPal: 8limbuzz@gmail.com
```

## Core Features

✅ **Secure Payment Creation** - Generate PayPal payment links with proper authentication  
✅ **Automated Redirection** - Return approval URLs for user checkout flow  
✅ **Business Account Integration** - Direct payouts to connected PayPal account  
✅ **Environment-Based Configuration** - Sandbox/production mode support  
✅ **Error Handling** - Comprehensive error responses from PayPal API  

## API Endpoints

### `POST /create-payment`
Creates a new payment and returns PayPal approval URL.

**Request:**
```json
{
  "productName": "Premium Membership",
  "price": "29.99"
}
```

**Response:**
```json
{
  "forwardUrl": "https://www.paypal.com/checkoutnow?token=EC-..."
}
```

For detailed API documentation, see [docs/API.md](docs/API.md)

## Configuration

Create `.env` file with:
```env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_EMAIL=your_business_email@example.com
PORT=3000
NODE_ENV=production
```

**⚠️ Important:** Never commit `.env` to version control. It's included in `.gitignore` by default.

## Connected Services

- **Website:** https://foreverfit-zpjz5xxm.manus.space
- **PayPal Business:** 8limbuzz@gmail.com

## Development

### Run with Auto-Reload
```bash
npm run dev
```

### Run Tests
```bash
npm test
```

## Project Structure
```
legendo-sync/
├── index.js           # Main Express app & PayPal integration
├── .env              # Environment variables (not committed)
├── .env.example      # Template for .env
├── .gitignore        # Git ignore rules
├── package.json      # Dependencies & scripts
├── docs/
│   └── API.md        # Detailed API documentation
└── README.md         # This file
```

## Security

- 🔒 Uses PayPal REST SDK with encrypted credentials
- 🔐 Sensitive credentials stored in `.env` (not tracked by git)
- 🛡️ Sandbox mode available for testing
- ⚡ CORS ready for frontend integration

## Troubleshooting

**Service won't start?**
- Check that Node.js is installed: `node --version`
- Verify `.env` file exists with valid credentials
- Check port 3000 isn't in use: `lsof -i :3000`

**PayPal errors?**
- Verify API credentials in `.env`
- Check PayPal account is active and in good standing
- See [docs/API.md](docs/API.md) for detailed error codes

## License

ISC

## Support

For issues or questions, open an issue on GitHub.

---

**Last Updated:** 2026  
**Status:** Active & Production-Ready ✅
