# LEGENDO SYNC

<div align="center">

**Vault-grade AI executor for asset synchronization and PayPal payment integration**

[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/express-4.18.2-blue)](https://expressjs.com/)
[![PayPal](https://img.shields.io/badge/PayPal-REST%20SDK-00457C)](https://developer.paypal.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🔍 Overview

LEGENDO SYNC is a powerful Node.js/Express server that provides:

- **Asset Synchronization**: Secure asset management and synchronization capabilities
- **PayPal Integration**: Complete PayPal payment processing workflow
- **RESTful API**: Well-documented, easy-to-use API endpoints
- **Security First**: API key authentication and input validation
- **Production Ready**: Comprehensive error handling and logging

---

## ✨ Features

### Core Features

- ✅ **Asset Sync Engine** - Efficient asset synchronization with status tracking
- 💳 **PayPal Payments** - Create, execute, and manage PayPal payments
- 🔐 **Authentication** - Optional API key authentication
- 📝 **Comprehensive Logging** - Structured logging with timestamps
- 🛡️ **Error Handling** - Centralized error handling middleware
- 📊 **Health Monitoring** - Health check endpoint for monitoring
- 🚀 **High Performance** - Asynchronous operations with Promise support

### Technical Features

- RESTful API design
- JSON request/response format
- Environment-based configuration
- JSDoc documentation throughout
- Graceful shutdown handling
- Production-ready architecture

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- PayPal Developer Account

### Installation

```bash
# Clone the repository
git clone https://github.com/HuzoBaz/legendo-sync.git
cd legendo-sync

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your PayPal credentials

# Start the server
npm start
```

The server will start on `http://localhost:3000`

### Quick Test

```bash
# Check server health
curl http://localhost:3000/health

# Trigger a sync
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}'
```

---

## 📚 Documentation

Comprehensive documentation is available in the following files:

- **[API.md](API.md)** - Complete API reference with all endpoints, parameters, and examples
- **[USAGE.md](USAGE.md)** - Detailed usage guide with setup instructions and integration examples
- **[index.js](index.js)** - Fully documented source code with JSDoc comments

### Quick Links

- [Installation Guide](USAGE.md#installation)
- [Configuration Guide](USAGE.md#configuration)
- [API Reference](API.md)
- [Integration Examples](USAGE.md#integration-examples)
- [Troubleshooting](USAGE.md#troubleshooting)

---

## 🔌 API Endpoints

### Health & Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/health` | Health check endpoint |

### Asset Synchronization

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/trigger` | Trigger asset synchronization |
| GET    | `/sync/:syncId` | Get synchronization status |

### PayPal Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/payment/create` | Create new payment |
| POST   | `/payment/execute` | Execute approved payment |
| GET    | `/payment/:paymentId` | Get payment details |
| GET    | `/success` | Payment success callback |
| GET    | `/cancel` | Payment cancel callback |

**[View Complete API Documentation →](API.md)**

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# API Authentication (Optional)
REQUIRE_API_KEY=false
API_KEY=your-secret-api-key

# PayPal Configuration
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_RETURN_URL=http://localhost:3000/success
PAYPAL_CANCEL_URL=http://localhost:3000/cancel
```

### Getting PayPal Credentials

1. Visit [PayPal Developer Portal](https://developer.paypal.com/)
2. Create an app under "My Apps & Credentials"
3. Copy your Client ID and Secret
4. Use **Sandbox** credentials for testing
5. Use **Live** credentials for production

**[View Complete Configuration Guide →](USAGE.md#configuration)**

---

## 💡 Usage Examples

### Asset Synchronization

```bash
# Trigger sync
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}'

# Response
{
  "status": "success",
  "message": "Asset sync completed",
  "syncId": "SYNC-1729166400000",
  "timestamp": "2025-10-17T12:00:00.000Z"
}
```

### Payment Processing

```bash
# Create payment
curl -X POST http://localhost:3000/payment/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "currency": "USD",
    "description": "Test Payment"
  }'

# Response includes approval URL
{
  "paymentId": "PAYID-M123456",
  "approvalUrl": "https://www.sandbox.paypal.com/...",
  "status": "created",
  "amount": 10.00,
  "currency": "USD"
}
```

### JavaScript Integration

```javascript
const axios = require('axios');

async function createPayment(amount) {
  const response = await axios.post('http://localhost:3000/payment/create', {
    amount: amount,
    currency: 'USD',
    description: 'My Payment'
  });
  
  // Redirect user to approval URL
  window.location.href = response.data.approvalUrl;
}
```

**[View More Examples →](USAGE.md#integration-examples)**

---

## 🛠️ Development

### Project Structure

```
legendo-sync/
├── index.js              # Main application file
├── package.json          # Project configuration
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment template
├── .gitignore           # Git ignore rules
├── README.md            # This file
├── API.md               # API documentation
└── USAGE.md             # Usage guide
```

### Available Scripts

```bash
# Start server
npm start

# Development mode (auto-restart)
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Development Dependencies

```bash
# Install dev dependencies
npm install --save-dev nodemon jest supertest eslint
```

---

## 🧪 Testing

### Manual Testing

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test with authentication
curl http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"input": "test"}'
```

### Automated Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

**[View Testing Guide →](USAGE.md#testing)**

---

## 🚢 Deployment

### Production Deployment

```bash
# Set production environment
export NODE_ENV=production
export PORT=3000

# Start with PM2
pm2 start index.js --name legendo-sync
pm2 save
```

### Docker Deployment

```bash
# Build image
docker build -t legendo-sync .

# Run container
docker run -p 3000:3000 --env-file .env legendo-sync
```

### Cloud Platforms

- **Heroku**: `git push heroku main`
- **AWS**: Deploy to EC2, Elastic Beanstalk, or ECS
- **Azure**: Deploy to App Service
- **Google Cloud**: Deploy to App Engine or Cloud Run

**[View Deployment Guide →](USAGE.md#deployment)**

---

## 📦 Classes and Components

### PayPalService

Handles all PayPal payment operations.

**Methods:**
- `createPayment(amount, currency, description)` - Create a new payment
- `executePayment(paymentId, payerId)` - Execute approved payment
- `getPaymentDetails(paymentId)` - Retrieve payment information

### AssetSyncService

Manages asset synchronization operations.

**Methods:**
- `initSync(input)` - Initialize synchronization
- `getSyncStatus(syncId)` - Check sync status

### Logger

Provides structured logging functionality.

**Methods:**
- `Logger.info(message, data)` - Log information
- `Logger.error(message, error)` - Log errors
- `Logger.warn(message, data)` - Log warnings

**[View Full Code Documentation →](index.js)**

---

## 🔒 Security

### Best Practices

- ✅ Never commit `.env` file to version control
- ✅ Use strong, unique API keys
- ✅ Enable HTTPS in production
- ✅ Validate all input data
- ✅ Keep dependencies updated
- ✅ Use environment-specific credentials
- ✅ Implement rate limiting for production

### API Key Authentication

Enable optional API key authentication:

```env
REQUIRE_API_KEY=true
API_KEY=your-secret-key-here
```

All requests must include header:
```
X-API-Key: your-secret-key-here
```

---

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

**PayPal API Errors**
- Verify credentials in `.env`
- Check `PAYPAL_MODE` (sandbox vs live)
- Ensure redirect URLs are configured

**Module Not Found**
```bash
npm install
```

**[View Complete Troubleshooting Guide →](USAGE.md#troubleshooting)**

---

## 📈 Performance

### Optimization Tips

- Use connection pooling for databases
- Implement caching for frequent requests
- Enable gzip compression
- Use CDN for static assets
- Monitor with tools like New Relic or DataDog

### Monitoring

```bash
# Check logs with PM2
pm2 logs legendo-sync

# Monitor resources
pm2 monit
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

1. Ensure all tests pass
2. Follow existing code style
3. Add tests for new features
4. Update documentation
5. Run linter before committing

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Resources

### Documentation

- [API Documentation](API.md)
- [Usage Guide](USAGE.md)
- [Code Documentation](index.js)

### External Links

- [PayPal REST API Docs](https://developer.paypal.com/docs/api/overview/)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 📞 Support

For issues, questions, or feature requests:

- 📧 Email: support@legendosync.com
- 🐛 Issues: [GitHub Issues](https://github.com/HuzoBaz/legendo-sync/issues)
- 📖 Documentation: [USAGE.md](USAGE.md)

---

## 🎯 Roadmap

### Upcoming Features

- [ ] WebSocket support for real-time sync updates
- [ ] Multiple payment gateway support (Stripe, Square)
- [ ] Advanced authentication (OAuth2, JWT)
- [ ] Database integration for persistence
- [ ] Admin dashboard
- [ ] Webhook support
- [ ] Rate limiting
- [ ] Request caching

---

## 👥 Authors

**LEGENDO SYNC Team**

---

## 🌟 Acknowledgments

- PayPal for their REST SDK
- Express.js community
- All contributors and users

---

<div align="center">

**Made with ❤️ by LEGENDO SYNC Team**

[Documentation](API.md) • [Usage Guide](USAGE.md) • [GitHub](https://github.com/HuzoBaz/legendo-sync)

</div>
