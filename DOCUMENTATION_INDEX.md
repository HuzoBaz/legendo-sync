# LEGENDO SYNC - Documentation Index

Complete documentation reference for all public APIs, functions, and components.

---

## 📚 Documentation Structure

This project includes comprehensive documentation across multiple files. Use this index to quickly navigate to the information you need.

---

## 📄 Core Documentation Files

### 1. README.md
**Main project documentation**

- Overview and features
- Quick start guide
- Configuration summary
- API endpoints overview
- Development setup
- Deployment instructions
- Contributing guidelines

**[→ View README.md](README.md)**

---

### 2. API.md
**Complete API Reference**

Detailed documentation for all REST API endpoints including:

- Authentication methods
- Request/response formats
- HTTP status codes
- Error handling
- Rate limiting guidance
- Complete code examples in multiple languages

**Endpoints documented:**
- Health check (`GET /health`)
- Asset synchronization (`POST /trigger`, `GET /sync/:syncId`)
- Payment creation (`POST /payment/create`)
- Payment execution (`POST /payment/execute`)
- Payment details (`GET /payment/:paymentId`)
- Payment callbacks (`GET /success`, `GET /cancel`)

**[→ View API.md](API.md)**

---

### 3. USAGE.md
**Comprehensive Usage Guide**

Step-by-step instructions for:

- Prerequisites and system requirements
- Installation (multiple methods)
- Environment configuration
- Getting PayPal credentials
- Running the server (development and production)
- Basic usage examples
- Integration examples (HTML/JavaScript, Node.js, React)
- Testing strategies
- Deployment options (PM2, Docker, Heroku, AWS)
- Troubleshooting common issues
- Best practices

**[→ View USAGE.md](USAGE.md)**

---

### 4. index.js
**Source Code Documentation**

Fully documented source code with JSDoc comments for:

**Classes:**
- `Logger` - Logging utility
- `PayPalService` - PayPal payment operations
- `AssetSyncService` - Asset synchronization

**Functions:**
- `validateRequest()` - Request validation middleware
- `errorHandler()` - Error handling middleware
- `gracefulShutdown()` - Shutdown handler

**API Route Handlers:**
- All endpoint implementations
- Request validation
- Response formatting
- Error handling

**[→ View index.js](index.js)**

---

## 🔍 Quick Reference by Topic

### Getting Started
1. [Installation Guide](USAGE.md#installation)
2. [Configuration](USAGE.md#configuration)
3. [Quick Start](README.md#quick-start)
4. [First API Call](API.md#examples)

### API Integration
1. [API Reference](API.md)
2. [Authentication](API.md#authentication)
3. [Error Handling](API.md#error-handling)
4. [Integration Examples](USAGE.md#integration-examples)

### Payment Processing
1. [Payment Flow Overview](API.md#paypal-payment-integration)
2. [Create Payment Endpoint](API.md#1-create-payment)
3. [Execute Payment Endpoint](API.md#2-execute-payment)
4. [Payment Examples](API.md#complete-payment-flow-example)

### Asset Synchronization
1. [Trigger Sync Endpoint](API.md#1-trigger-asset-sync)
2. [Check Sync Status](API.md#2-get-sync-status)
3. [Sync Examples](API.md#asset-sync-example)

### Development
1. [Project Structure](README.md#project-structure)
2. [Available Scripts](README.md#available-scripts)
3. [Testing](USAGE.md#testing)
4. [Contributing](README.md#contributing)

### Deployment
1. [Production Deployment](USAGE.md#deploy-to-production-server)
2. [Docker Deployment](USAGE.md#deploy-with-docker)
3. [Cloud Platforms](USAGE.md#deploy-to-cloud-platforms)
4. [Best Practices](USAGE.md#best-practices)

### Troubleshooting
1. [Common Issues](USAGE.md#common-issues)
2. [Debug Mode](USAGE.md#debug-mode)
3. [Check Logs](USAGE.md#check-logs)

---

## 📦 Code Documentation

### Public Classes

#### Logger
Structured logging utility with timestamp support.

**Methods:**
- `Logger.info(message, data)` - Log info messages
- `Logger.error(message, error)` - Log error messages
- `Logger.warn(message, data)` - Log warning messages

**Location:** [index.js:20-45](index.js)

---

#### PayPalService
Service class for PayPal payment operations.

**Methods:**
- `PayPalService.createPayment(amount, currency, description)` - Create payment
- `PayPalService.executePayment(paymentId, payerId)` - Execute payment
- `PayPalService.getPaymentDetails(paymentId)` - Get payment details

**Location:** [index.js:50-140](index.js)

---

#### AssetSyncService
Service class for asset synchronization.

**Methods:**
- `AssetSyncService.initSync(input)` - Initialize sync
- `AssetSyncService.getSyncStatus(syncId)` - Get sync status

**Location:** [index.js:145-180](index.js)

---

### Public Middleware

#### validateRequest(req, res, next)
Validates API key authentication if required.

**Location:** [index.js:185-195](index.js)

---

#### errorHandler(err, req, res, next)
Centralized error handling for all routes.

**Location:** [index.js:200-210](index.js)

---

## 🔌 API Endpoints Reference

### Quick Links

| Endpoint | Method | Purpose | Documentation |
|----------|--------|---------|---------------|
| `/health` | GET | Health check | [API.md](API.md#health-check) |
| `/trigger` | POST | Trigger sync | [API.md](API.md#1-trigger-asset-sync) |
| `/sync/:syncId` | GET | Sync status | [API.md](API.md#2-get-sync-status) |
| `/payment/create` | POST | Create payment | [API.md](API.md#1-create-payment) |
| `/payment/execute` | POST | Execute payment | [API.md](API.md#2-execute-payment) |
| `/payment/:paymentId` | GET | Payment details | [API.md](API.md#3-get-payment-details) |
| `/success` | GET | Payment success | [API.md](API.md#4-payment-success-callback) |
| `/cancel` | GET | Payment cancel | [API.md](API.md#5-payment-cancel-callback) |

---

## 📝 Examples by Language

### cURL Examples
- [Health Check](API.md#health-check)
- [Asset Sync](API.md#asset-sync-example)
- [Payment Flow](API.md#complete-payment-flow-example)

### JavaScript/Node.js Examples
- [Using Axios](API.md#javascriptnodejs-example)
- [Express Integration](USAGE.md#nodejsexpress-integration)
- [React Component](USAGE.md#react-integration)

### Python Examples
- [Using Requests](API.md#python-example)

### HTML/Browser Examples
- [Web Integration](USAGE.md#web-application-integration-html--javascript)

---

## 🔧 Configuration Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | development | Environment mode |
| `REQUIRE_API_KEY` | No | false | Enable API authentication |
| `API_KEY` | Conditional | - | API key for authentication |
| `PAYPAL_MODE` | Yes | sandbox | PayPal mode (sandbox/live) |
| `PAYPAL_CLIENT_ID` | Yes | - | PayPal client ID |
| `PAYPAL_CLIENT_SECRET` | Yes | - | PayPal client secret |
| `PAYPAL_RETURN_URL` | No | /success | Payment success URL |
| `PAYPAL_CANCEL_URL` | No | /cancel | Payment cancel URL |

**[View Configuration Guide →](USAGE.md#configuration)**

---

## 🧪 Testing Documentation

### Test Types
1. [Manual Testing](USAGE.md#manual-testing)
2. [Automated Testing](USAGE.md#automated-testing-with-jest)
3. [Integration Testing](USAGE.md#testing)

---

## 🚀 Deployment Options

### Available Platforms
1. [Production Server](USAGE.md#deploy-to-production-server)
2. [Docker](USAGE.md#deploy-with-docker)
3. [Heroku](USAGE.md#heroku)
4. [AWS EC2](USAGE.md#aws-ec2)

---

## 📊 Project Files

### Configuration Files
- `package.json` - Project dependencies and scripts
- `.env.example` - Environment variable template
- `.gitignore` - Git ignore rules

### Documentation Files
- `README.md` - Main documentation
- `API.md` - API reference
- `USAGE.md` - Usage guide
- `DOCUMENTATION_INDEX.md` - This file

### Source Files
- `index.js` - Main application file

---

## 🎯 Common Use Cases

### Use Case 1: Simple Asset Sync
1. [Configure environment](USAGE.md#configuration)
2. [Start server](README.md#quick-start)
3. [Trigger sync](API.md#1-trigger-asset-sync)
4. [Check status](API.md#2-get-sync-status)

### Use Case 2: Payment Processing
1. [Set up PayPal](USAGE.md#get-paypal-credentials)
2. [Create payment](API.md#1-create-payment)
3. [User approves on PayPal](API.md#complete-payment-flow-example)
4. [Execute payment](API.md#2-execute-payment)

### Use Case 3: Web Application Integration
1. [Review integration examples](USAGE.md#integration-examples)
2. [Implement client code](USAGE.md#web-application-integration-html--javascript)
3. [Handle callbacks](API.md#4-payment-success-callback)
4. [Test thoroughly](USAGE.md#testing)

---

## 🔗 External Resources

### Official Documentation
- [PayPal REST API](https://developer.paypal.com/docs/api/overview/)
- [Express.js](https://expressjs.com/)
- [Node.js](https://nodejs.org/)

### Related Topics
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [REST API Design](https://restfulapi.net/)
- [PayPal Sandbox Testing](https://developer.paypal.com/docs/api-basics/sandbox/)

---

## 📞 Support & Community

### Getting Help
1. Check [Troubleshooting Guide](USAGE.md#troubleshooting)
2. Review [API Documentation](API.md)
3. Search [GitHub Issues](https://github.com/HuzoBaz/legendo-sync/issues)
4. Contact support team

---

## 🔄 Version Information

**Current Version:** 1.0.0  
**Last Updated:** 2025-10-17  
**Node.js Required:** >=14.0.0  
**npm Required:** >=6.0.0

---

## ✅ Documentation Checklist

This project includes:

- ✅ Comprehensive README
- ✅ Complete API reference
- ✅ Detailed usage guide
- ✅ JSDoc code documentation
- ✅ Configuration examples
- ✅ Integration examples (multiple languages)
- ✅ Testing documentation
- ✅ Deployment instructions
- ✅ Troubleshooting guide
- ✅ Security best practices
- ✅ Performance optimization tips
- ✅ Contributing guidelines

---

<div align="center">

**Complete Documentation Suite for LEGENDO SYNC**

[README](README.md) • [API Reference](API.md) • [Usage Guide](USAGE.md) • [Source Code](index.js)

</div>
