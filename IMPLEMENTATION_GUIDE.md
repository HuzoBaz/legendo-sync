# LEGENDO SYNC - Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the LEGENDO SYNC application based on the current placeholder code. The implementation will create a fully functional PayPal integration service with asset synchronization capabilities.

## Implementation Steps

### Step 1: Project Setup

1. **Initialize the project structure:**
   ```bash
   mkdir legendo-sync
   cd legendo-sync
   npm init -y
   ```

2. **Install required dependencies:**
   ```bash
   npm install express paypal-rest-sdk dotenv cors helmet morgan
   npm install --save-dev nodemon jest supertest
   ```

3. **Create project structure:**
   ```
   legendo-sync/
   ├── src/
   │   ├── config/
   │   │   ├── paypal.js
   │   │   └── environment.js
   │   ├── controllers/
   │   │   └── triggerController.js
   │   ├── middleware/
   │   │   ├── errorHandler.js
   │   │   ├── validation.js
   │   │   └── logging.js
   │   ├── services/
   │   │   ├── paypalService.js
   │   │   ├── assetSyncService.js
   │   │   └── legendoSyncService.js
   │   ├── utils/
   │   │   ├── idGenerator.js
   │   │   └── cache.js
   │   └── app.js
   ├── tests/
   │   ├── unit/
   │   └── integration/
   ├── .env.example
   ├── .gitignore
   ├── package.json
   └── index.js
   ```

### Step 2: Environment Configuration

Create `.env.example`:
```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_EMAIL=your_paypal_email@example.com

# Server Configuration
PORT=3000
NODE_ENV=development

# Optional: Logging
LOG_LEVEL=info
```

Create `.gitignore`:
```gitignore
node_modules/
.env
*.log
.DS_Store
coverage/
.nyc_output/
```

### Step 3: Core Implementation

#### 3.1 Environment Configuration (`src/config/environment.js`)

```javascript
const dotenv = require('dotenv');

dotenv.config();

const required = ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_EMAIL'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

module.exports = {
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    email: process.env.PAYPAL_EMAIL
  },
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};
```

#### 3.2 PayPal Configuration (`src/config/paypal.js`)

```javascript
const paypal = require('paypal-rest-sdk');
const config = require('./environment');

paypal.configure({
  mode: config.server.nodeEnv === 'production' ? 'live' : 'sandbox',
  client_id: config.paypal.clientId,
  client_secret: config.paypal.clientSecret
});

module.exports = paypal;
```

#### 3.3 ID Generator Utility (`src/utils/idGenerator.js`)

```javascript
const crypto = require('crypto');

function generateOperationId() {
  return crypto.randomUUID();
}

function generateShortId() {
  return crypto.randomBytes(8).toString('hex');
}

module.exports = {
  generateOperationId,
  generateShortId
};
```

#### 3.4 Cache Utility (`src/utils/cache.js`)

```javascript
class SimpleCache {
  constructor(ttl = 300000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

module.exports = new SimpleCache();
```

#### 3.5 Validation Middleware (`src/middleware/validation.js`)

```javascript
function validateTriggerInput(req, res, next) {
  const { input } = req.body;
  const errors = [];

  if (!input || typeof input !== 'string') {
    errors.push('Input must be a non-empty string');
  }

  if (input && input.length > 1000) {
    errors.push('Input must be less than 1000 characters');
  }

  if (input && input.trim().length === 0) {
    errors.push('Input cannot be empty or whitespace only');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid input provided',
      error_code: 'INVALID_INPUT',
      details: errors
    });
  }

  next();
}

module.exports = {
  validateTriggerInput
};
```

#### 3.6 Error Handler Middleware (`src/middleware/errorHandler.js`)

```javascript
function errorHandler(error, req, res, next) {
  console.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    status: 'error',
    message: message,
    error_code: error.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error.details 
    })
  });
}

function createError(message, statusCode = 500, code = 'INTERNAL_ERROR') {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

module.exports = {
  errorHandler,
  createError
};
```

#### 3.7 Logging Middleware (`src/middleware/logging.js`)

```javascript
const morgan = require('morgan');

const logger = morgan('combined', {
  skip: (req, res) => res.statusCode < 400
});

module.exports = logger;
```

#### 3.8 PayPal Service (`src/services/paypalService.js`)

```javascript
const paypal = require('../config/paypal');
const { createError } = require('../middleware/errorHandler');

class PayPalService {
  async createPayment(amount, description) {
    try {
      const payment = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal'
        },
        transactions: [{
          amount: {
            currency: 'USD',
            total: amount.toString()
          },
          description: description
        }],
        redirect_urls: {
          return_url: process.env.PAYPAL_RETURN_URL || 'http://localhost:3000/success',
          cancel_url: process.env.PAYPAL_CANCEL_URL || 'http://localhost:3000/cancel'
        }
      };

      return new Promise((resolve, reject) => {
        paypal.payment.create(payment, (error, payment) => {
          if (error) {
            reject(createError('PayPal payment creation failed', 500, 'PAYPAL_ERROR'));
          } else {
            resolve(payment);
          }
        });
      });
    } catch (error) {
      throw createError('PayPal service error', 500, 'PAYPAL_ERROR');
    }
  }

  async executePayment(paymentId, payerId) {
    try {
      const execute_payment = {
        payer_id: payerId
      };

      return new Promise((resolve, reject) => {
        paypal.payment.execute(paymentId, execute_payment, (error, payment) => {
          if (error) {
            reject(createError('PayPal payment execution failed', 500, 'PAYPAL_ERROR'));
          } else {
            resolve(payment);
          }
        });
      });
    } catch (error) {
      throw createError('PayPal execution error', 500, 'PAYPAL_ERROR');
    }
  }
}

module.exports = new PayPalService();
```

#### 3.9 Asset Sync Service (`src/services/assetSyncService.js`)

```javascript
const { generateOperationId } = require('../utils/idGenerator');
const { createError } = require('../middleware/errorHandler');

class AssetSyncService {
  async identifyAssets(input) {
    const assets = [];
    
    // Simple asset identification logic
    if (input.includes('LEGENDO')) {
      assets.push({
        id: generateOperationId(),
        type: 'text',
        content: input,
        priority: 'high',
        metadata: {
          source: 'input',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Add more sophisticated asset identification logic here
    return assets;
  }

  async syncAsset(asset) {
    try {
      // Simulate asset sync operation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        asset_id: asset.id,
        type: asset.type,
        status: 'synced',
        timestamp: new Date().toISOString(),
        metadata: asset.metadata
      };
    } catch (error) {
      return {
        asset_id: asset.id,
        type: asset.type,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async syncAssets(input) {
    try {
      const assets = await this.identifyAssets(input);
      const syncResults = [];

      for (const asset of assets) {
        const result = await this.syncAsset(asset);
        syncResults.push(result);
      }

      return {
        status: 'completed',
        assets_processed: assets.length,
        results: syncResults,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw createError('Asset synchronization failed', 500, 'ASSET_SYNC_ERROR');
    }
  }
}

module.exports = new AssetSyncService();
```

#### 3.10 LEGENDO SYNC Service (`src/services/legendoSyncService.js`)

```javascript
const { generateOperationId } = require('../utils/idGenerator');
const paypalService = require('./paypalService');
const assetSyncService = require('./assetSyncService');
const { createError } = require('../middleware/errorHandler');

class LegendoSyncService {
  async processInput(input) {
    // Process and transform input
    let processed = input.trim();
    
    // Apply business logic transformations
    processed = processed.toUpperCase();
    
    // Add processing metadata
    const timestamp = new Date().toISOString();
    processed = `[${timestamp}] ${processed}`;
    
    return processed;
  }

  async executePayPalOperations(processedInput) {
    try {
      // Determine if PayPal operations are needed
      const needsPayPal = this.shouldExecutePayPal(processedInput);
      
      if (!needsPayPal) {
        return {
          status: 'skipped',
          message: 'No PayPal operations required',
          timestamp: new Date().toISOString()
        };
      }

      // Execute PayPal operations
      const payment = await paypalService.createPayment(
        '1.00', // Default amount
        `LEGENDO SYNC: ${processedInput}`
      );

      return {
        status: 'completed',
        payment_id: payment.id,
        message: 'PayPal operations completed',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw createError('PayPal operations failed', 500, 'PAYPAL_OPERATION_ERROR');
    }
  }

  shouldExecutePayPal(input) {
    // Business logic to determine if PayPal operations are needed
    return input.includes('PAYMENT') || input.includes('PAYPAL');
  }

  async process(input) {
    const operationId = generateOperationId();
    const timestamp = new Date().toISOString();

    try {
      // Process input
      const processedInput = await this.processInput(input);

      // Execute PayPal operations
      const paypalResult = await this.executePayPalOperations(processedInput);

      // Sync assets
      const syncResult = await assetSyncService.syncAssets(processedInput);

      return {
        processed_input: processedInput,
        timestamp: timestamp,
        operation_id: operationId,
        paypal_result: paypalResult,
        sync_result: syncResult
      };
    } catch (error) {
      console.error('LEGENDO SYNC processing failed:', error);
      throw error;
    }
  }
}

module.exports = new LegendoSyncService();
```

#### 3.11 Trigger Controller (`src/controllers/triggerController.js`)

```javascript
const legendoSyncService = require('../services/legendoSyncService');
const { createError } = require('../middleware/errorHandler');

class TriggerController {
  async handleTrigger(req, res, next) {
    try {
      const { input } = req.body;
      
      // Process the input through LEGENDO SYNC
      const result = await legendoSyncService.process(input);
      
      // Return success response
      res.status(200).json({
        status: 'success',
        message: 'LEGENDO SYNC operation completed',
        data: result
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TriggerController();
```

#### 3.12 Main Application (`src/app.js`)

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('./middleware/errorHandler');
const loggingMiddleware = require('./middleware/logging');
const { validateTriggerInput } = require('./middleware/validation');
const triggerController = require('./controllers/triggerController');

function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Logging middleware
  app.use(loggingMiddleware);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'LEGENDO SYNC'
    });
  });

  // Main trigger endpoint
  app.post('/trigger', validateTriggerInput, triggerController.handleTrigger);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
```

#### 3.13 Entry Point (`index.js`)

```javascript
const createApp = require('./src/app');
const config = require('./src/config/environment');

// Load environment variables
require('dotenv').config();

const app = createApp();

const server = app.listen(config.server.port, () => {
  console.log(`LEGENDO SYNC running on port ${config.server.port}`);
  console.log(`Environment: ${config.server.nodeEnv}`);
  console.log(`Health check: http://localhost:${config.server.port}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
```

### Step 4: Testing Implementation

#### 4.1 Unit Tests (`tests/unit/legendoSyncService.test.js`)

```javascript
const legendoSyncService = require('../../src/services/legendoSyncService');

describe('LegendoSyncService', () => {
  test('should process input correctly', async () => {
    const input = 'HALO BA LEGENDO';
    const result = await legendoSyncService.processInput(input);
    
    expect(result).toContain('HALO BA LEGENDO');
    expect(result).toContain('[');
  });

  test('should determine PayPal execution correctly', () => {
    expect(legendoSyncService.shouldExecutePayPal('PAYMENT REQUIRED')).toBe(true);
    expect(legendoSyncService.shouldExecutePayPal('HALO BA LEGENDO')).toBe(false);
  });
});
```

#### 4.2 Integration Tests (`tests/integration/trigger.test.js`)

```javascript
const request = require('supertest');
const createApp = require('../../src/app');

describe('POST /trigger', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  test('should handle valid input', async () => {
    const response = await request(app)
      .post('/trigger')
      .send({ input: 'HALO BA LEGENDO' })
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('operation_id');
  });

  test('should reject invalid input', async () => {
    const response = await request(app)
      .post('/trigger')
      .send({ input: '' })
      .expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.error_code).toBe('INVALID_INPUT');
  });
});
```

### Step 5: Package.json Scripts

Update `package.json`:

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Step 6: Deployment Configuration

#### 6.1 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

#### 6.2 Docker Compose

```yaml
version: '3.8'
services:
  legendo-sync:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PAYPAL_CLIENT_ID=${PAYPAL_CLIENT_ID}
      - PAYPAL_CLIENT_SECRET=${PAYPAL_CLIENT_SECRET}
      - PAYPAL_EMAIL=${PAYPAL_EMAIL}
    restart: unless-stopped
```

## Testing the Implementation

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Test the health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Test the trigger endpoint:**
   ```bash
   curl -X POST http://localhost:3000/trigger \
     -H "Content-Type: application/json" \
     -d '{"input": "HALO BA LEGENDO"}'
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

## Next Steps

1. **Add more sophisticated asset identification logic**
2. **Implement proper logging with Winston**
3. **Add rate limiting**
4. **Implement authentication/authorization**
5. **Add monitoring and metrics**
6. **Create API documentation with Swagger**
7. **Add database integration for persistence**
8. **Implement proper error tracking**

---

*This implementation guide is generated for LEGENDO SYNC v1.0.0*