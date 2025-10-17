# LEGENDO SYNC

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express-4.x-blue.svg)](https://expressjs.com/)
[![PayPal SDK](https://img.shields.io/badge/paypal-rest--sdk-latest-orange.svg)](https://github.com/paypal/PayPal-node-SDK)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A vault-grade AI executor for asset sync and PayPal injection. LEGENDO SYNC provides a robust RESTful API for triggering PayPal operations and managing asset synchronization with comprehensive error handling and monitoring capabilities.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/HuzoBaz/legendo-sync.git
cd legendo-sync

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your PayPal credentials

# Start the service
npm start
```

**Test the API:**
```bash
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}'
```

## 📚 Documentation

- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference with examples
- **[Function Documentation](FUNCTION_DOCUMENTATION.md)** - Detailed function and component docs
- **[Implementation Guide](IMPLEMENTATION_GUIDE.md)** - Step-by-step implementation instructions

## 🏗️ Architecture

```
LEGENDO SYNC
├── API Layer (Express.js)
├── Business Logic Layer
│   ├── Input Processing
│   ├── PayPal Integration
│   └── Asset Synchronization
├── Service Layer
│   ├── PayPal Service
│   ├── Asset Sync Service
│   └── LEGENDO SYNC Service
└── Infrastructure Layer
    ├── Configuration Management
    ├── Error Handling
    └── Logging
```

## 🔧 Features

- **PayPal Integration**: Full PayPal REST API integration with sandbox and production support
- **Asset Synchronization**: Intelligent asset identification and synchronization
- **Input Processing**: Advanced input validation and transformation
- **Error Handling**: Comprehensive error handling with detailed error codes
- **Caching**: Built-in caching for improved performance
- **Logging**: Structured logging with configurable levels
- **Health Monitoring**: Built-in health check endpoints
- **Security**: Helmet.js security headers and CORS support

## 🛠️ API Endpoints

### POST /trigger
Triggers LEGENDO SYNC operation with input processing, PayPal integration, and asset synchronization.

**Request:**
```json
{
  "input": "HALO BA LEGENDO"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "LEGENDO SYNC operation completed",
  "data": {
    "processed_input": "[2024-01-01T12:00:00.000Z] HALO BA LEGENDO",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "operation_id": "550e8400-e29b-41d4-a716-446655440000",
    "paypal_result": { ... },
    "sync_result": { ... }
  }
}
```

### GET /health
Health check endpoint for monitoring and load balancer health checks.

## 🔐 Environment Configuration

Create a `.env` file with the following variables:

```env
# PayPal Configuration (Required)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_EMAIL=your_paypal_email@example.com

# Server Configuration (Optional)
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

## 📦 Installation

### Prerequisites
- Node.js 14.0.0 or higher
- npm or yarn package manager
- PayPal Developer Account

### Dependencies
- **express**: Web framework for Node.js
- **paypal-rest-sdk**: PayPal REST API SDK
- **dotenv**: Environment variable loader
- **cors**: Cross-Origin Resource Sharing middleware
- **helmet**: Security middleware
- **morgan**: HTTP request logger

### Development Dependencies
- **nodemon**: Development server with auto-restart
- **jest**: Testing framework
- **supertest**: HTTP assertion library

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build Docker image
docker build -t legendo-sync .

# Run container
docker run -p 3000:3000 \
  -e PAYPAL_CLIENT_ID=your_client_id \
  -e PAYPAL_CLIENT_SECRET=your_client_secret \
  -e PAYPAL_EMAIL=your_email \
  legendo-sync
```

### PM2 Deployment
```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start index.js --name legendo-sync

# Monitor application
pm2 monit
```

## 📊 Monitoring

The application includes built-in monitoring capabilities:

- **Health Check**: `/health` endpoint for load balancer health checks
- **Structured Logging**: JSON-formatted logs with configurable levels
- **Error Tracking**: Comprehensive error handling with detailed error codes
- **Performance Metrics**: Request timing and response metrics

## 🔒 Security

- **Helmet.js**: Security headers for protection against common vulnerabilities
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Input Validation**: Comprehensive input validation and sanitization
- **Environment Variables**: Secure credential management
- **Error Handling**: Secure error responses without sensitive data exposure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [API Documentation](API_DOCUMENTATION.md) for detailed API reference
2. Review the [Function Documentation](FUNCTION_DOCUMENTATION.md) for implementation details
3. Follow the [Implementation Guide](IMPLEMENTATION_GUIDE.md) for setup instructions
4. Open an issue on GitHub for bug reports or feature requests

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - PayPal integration
  - Asset synchronization
  - Input processing
  - Error handling
  - Health monitoring

---

**LEGENDO SYNC** - Vault-grade AI executor for asset sync and PayPal injection
