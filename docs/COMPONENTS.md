# LEGENDO SYNC Components Documentation

## Overview

This document provides comprehensive documentation for all components, classes, and modules within the LEGENDO SYNC system. Each component is documented with its purpose, interface, usage examples, and integration patterns.

## Table of Contents

- [Core Components](#core-components)
- [Security Components](#security-components)
- [PayPal Integration Components](#paypal-integration-components)
- [Middleware Components](#middleware-components)
- [Utility Components](#utility-components)
- [Configuration Components](#configuration-components)

## Core Components

### LegendoSync Class

The main orchestrator class that handles all AI execution, asset synchronization, and system coordination.

#### Purpose
- Central coordinator for all LEGENDO SYNC operations
- Manages sessions, asset caching, and security
- Provides vault-grade encryption and processing

#### Interface

```javascript
class LegendoSync {
  constructor()
  
  // Core Methods
  async executeAI(input, options = {})
  async syncAssets(assets)
  async injectPayPal(paypalData)
  
  // Security Methods
  encrypt(text)
  decrypt(encryptedData)
  
  // Management Methods
  getVaultStatus()
  getSession(sessionId)
  cleanup(maxAge = 3600000)
}
```

#### Properties

```javascript
{
  sessions: Map,           // Active session storage
  assetCache: Map,         // Encrypted asset cache
  encryptionKey: string    // AES-256 encryption key
}
```

#### Usage Examples

**Basic Initialization:**
```javascript
const { LegendoSync } = require('./index');
const sync = new LegendoSync();

// Execute AI command
const result = await sync.executeAI('HALO BA LEGENDO');
console.log('Activation result:', result);
```

**Advanced Asset Synchronization:**
```javascript
const assets = [
  {
    id: 'financial-report-2023',
    type: 'document',
    data: {
      title: 'Q4 Financial Report',
      content: 'Sensitive financial data...',
      classification: 'confidential'
    },
    metadata: {
      department: 'finance',
      created: new Date().toISOString(),
      version: '2.1'
    }
  },
  {
    id: 'user-avatar-001',
    type: 'image',
    data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    metadata: {
      format: 'png',
      dimensions: '256x256',
      userId: 'user-123'
    }
  }
];

const syncResult = await sync.syncAssets(assets);
console.log(`Successfully synced ${syncResult.syncedAssets} assets`);

// Retrieve specific asset later
const assetId = syncResult.results[0].assetId;
// Asset is stored encrypted in assetCache
```

**Session Management:**
```javascript
// Execute with custom session
const sessionResult = await sync.executeAI('VAULT_STATUS', {
  sessionId: 'audit-session-2023-10-17'
});

// Retrieve session data later
const sessionData = sync.getSession('audit-session-2023-10-17');
console.log('Session history:', sessionData);

// Cleanup old sessions (older than 2 hours)
sync.cleanup(2 * 60 * 60 * 1000);
```

#### Integration Patterns

**Microservice Integration:**
```javascript
// Service wrapper for microservice architecture
class LegendoSyncService {
  constructor() {
    this.sync = new LegendoSync();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Handle cleanup events
    setInterval(() => {
      this.sync.cleanup();
    }, 30 * 60 * 1000); // Every 30 minutes
  }

  async processRequest(request) {
    const { type, data, sessionId } = request;
    
    switch (type) {
      case 'AI_EXECUTE':
        return await this.sync.executeAI(data.input, { sessionId, ...data.options });
      
      case 'ASSET_SYNC':
        return await this.sync.syncAssets(data.assets);
      
      case 'PAYPAL_PROCESS':
        return await this.sync.injectPayPal(data.paypalData);
      
      default:
        throw new Error(`Unknown request type: ${type}`);
    }
  }
}
```

---

### AI Command Processor

Internal component that handles AI command parsing and execution.

#### Purpose
- Processes and validates AI commands
- Routes commands to appropriate handlers
- Provides extensible command system

#### Command Handlers

```javascript
const commandHandlers = {
  'HALO BA LEGENDO': () => ({
    message: 'LEGENDO SYNC activated successfully',
    status: 'active',
    capabilities: ['asset_sync', 'paypal_injection', 'vault_security']
  }),
  
  'SYNC_ASSETS': (options) => this.syncAssets(options.assets || []),
  
  'PAYPAL_INJECT': (options) => this.injectPayPal(options.paypalData || {}),
  
  'VAULT_STATUS': () => this.getVaultStatus(),
  
  'HEALTH_CHECK': () => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
};
```

#### Custom Command Extension

```javascript
// Extend command system
class ExtendedLegendoSync extends LegendoSync {
  async processCommand(command, options) {
    // Custom commands
    const customCommands = {
      'BACKUP_VAULT': () => this.backupVault(),
      'RESTORE_VAULT': (options) => this.restoreVault(options.backupId),
      'AUDIT_TRAIL': () => this.generateAuditTrail(),
      'SECURITY_SCAN': () => this.performSecurityScan()
    };

    const normalizedCommand = command.toUpperCase().trim();
    
    if (customCommands[normalizedCommand]) {
      return await customCommands[normalizedCommand](options);
    }

    // Fall back to parent implementation
    return await super.processCommand(command, options);
  }

  async backupVault() {
    // Implementation for vault backup
    const backup = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      sessions: Array.from(this.sessions.entries()),
      assets: Array.from(this.assetCache.entries())
    };
    
    // Store backup securely
    return { backupId: backup.id, status: 'completed' };
  }
}
```

---

## Security Components

### Encryption Module

Handles all cryptographic operations with vault-grade security.

#### Purpose
- AES-256-GCM encryption for sensitive data
- Secure key management
- Data integrity verification

#### Interface

```javascript
class EncryptionModule {
  constructor(encryptionKey)
  
  encrypt(text)           // Returns { encrypted, iv, authTag }
  decrypt(encryptedData)  // Returns decrypted text
  generateKey()           // Generates new encryption key
  rotateKey(newKey)       // Rotates encryption key
}
```

#### Usage Examples

**Basic Encryption:**
```javascript
const crypto = require('crypto');

// Generate secure key
const encryptionKey = crypto.randomBytes(32).toString('hex');
const encryption = new EncryptionModule(encryptionKey);

// Encrypt sensitive data
const sensitiveData = JSON.stringify({
  creditCard: '4111-1111-1111-1111',
  ssn: '123-45-6789',
  apiKey: 'sk_live_abc123'
});

const encrypted = encryption.encrypt(sensitiveData);
console.log('Encrypted:', encrypted);

// Decrypt when needed
const decrypted = encryption.decrypt(encrypted);
console.log('Decrypted:', JSON.parse(decrypted));
```

**Key Rotation:**
```javascript
// Rotate encryption key periodically
class SecureVault {
  constructor() {
    this.encryption = new EncryptionModule();
    this.setupKeyRotation();
  }

  setupKeyRotation() {
    // Rotate key every 24 hours
    setInterval(() => {
      const newKey = crypto.randomBytes(32).toString('hex');
      this.rotateEncryptionKey(newKey);
    }, 24 * 60 * 60 * 1000);
  }

  rotateEncryptionKey(newKey) {
    // Re-encrypt all cached data with new key
    const oldEncryption = this.encryption;
    this.encryption = new EncryptionModule(newKey);

    // Re-encrypt existing data
    for (const [id, encryptedData] of this.assetCache.entries()) {
      try {
        const decrypted = oldEncryption.decrypt(encryptedData);
        const reencrypted = this.encryption.encrypt(decrypted);
        this.assetCache.set(id, reencrypted);
      } catch (error) {
        console.error(`Failed to re-encrypt asset ${id}:`, error);
      }
    }
  }
}
```

---

### Session Manager

Manages secure sessions with automatic cleanup and validation.

#### Purpose
- Secure session creation and management
- Session data encryption
- Automatic expiration and cleanup

#### Interface

```javascript
class SessionManager {
  constructor(encryptionModule)
  
  createSession(sessionId, data)
  getSession(sessionId)
  updateSession(sessionId, data)
  deleteSession(sessionId)
  cleanupExpired(maxAge)
  getAllActiveSessions()
}
```

#### Usage Examples

**Session Lifecycle Management:**
```javascript
class SecureSessionManager extends SessionManager {
  constructor(encryptionModule) {
    super(encryptionModule);
    this.sessions = new Map();
    this.sessionMetadata = new Map();
  }

  createSession(sessionId, data, options = {}) {
    const session = {
      id: sessionId || crypto.randomUUID(),
      data: this.encryption.encrypt(JSON.stringify(data)),
      created: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (options.ttl || 3600000)).toISOString(),
      metadata: options.metadata || {}
    };

    this.sessions.set(session.id, session);
    this.sessionMetadata.set(session.id, {
      accessCount: 0,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent
    });

    return session.id;
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check expiration
    if (new Date() > new Date(session.expiresAt)) {
      this.deleteSession(sessionId);
      return null;
    }

    // Update access tracking
    session.lastAccessed = new Date().toISOString();
    const metadata = this.sessionMetadata.get(sessionId);
    if (metadata) {
      metadata.accessCount++;
    }

    // Decrypt and return data
    try {
      const decryptedData = this.encryption.decrypt(session.data);
      return {
        ...session,
        data: JSON.parse(decryptedData)
      };
    } catch (error) {
      console.error(`Failed to decrypt session ${sessionId}:`, error);
      this.deleteSession(sessionId);
      return null;
    }
  }
}
```

---

## PayPal Integration Components

### PayPal Payment Processor

Handles all PayPal payment operations with secure credential management.

#### Purpose
- PayPal SDK integration
- Payment creation and execution
- Webhook handling
- Error management

#### Interface

```javascript
class PayPalProcessor {
  constructor(config)
  
  async createPayment(paymentData)
  async executePayment(paymentId, payerId)
  async getPaymentDetails(paymentId)
  async refundPayment(paymentId, refundData)
  async handleWebhook(webhookData)
}
```

#### Usage Examples

**Complete Payment Flow:**
```javascript
class PayPalPaymentFlow {
  constructor(paypalProcessor) {
    this.paypal = paypalProcessor;
    this.pendingPayments = new Map();
  }

  async initiatePayment(orderData) {
    const paymentData = {
      items: orderData.items.map(item => ({
        name: item.name,
        sku: item.sku,
        price: item.price.toString(),
        currency: item.currency || 'USD',
        quantity: item.quantity
      })),
      total: orderData.total.toString(),
      currency: orderData.currency || 'USD',
      description: orderData.description,
      returnUrl: `${process.env.BASE_URL}/payment/success`,
      cancelUrl: `${process.env.BASE_URL}/payment/cancel`
    };

    try {
      const payment = await this.paypal.createPayment(paymentData);
      
      // Store payment details for later execution
      this.pendingPayments.set(payment.paymentId, {
        orderData,
        paymentData,
        created: new Date().toISOString()
      });

      return {
        paymentId: payment.paymentId,
        approvalUrl: payment.approvalUrl,
        status: 'pending_approval'
      };
    } catch (error) {
      throw new Error(`Payment initiation failed: ${error.message}`);
    }
  }

  async completePayment(paymentId, payerId) {
    const pendingPayment = this.pendingPayments.get(paymentId);
    if (!pendingPayment) {
      throw new Error('Payment not found or expired');
    }

    try {
      const result = await this.paypal.executePayment(paymentId, payerId);
      
      // Remove from pending payments
      this.pendingPayments.delete(paymentId);

      // Log successful payment
      console.log(`Payment completed: ${paymentId}`, {
        amount: pendingPayment.paymentData.total,
        currency: pendingPayment.paymentData.currency,
        items: pendingPayment.paymentData.items.length
      });

      return {
        paymentId: result.paymentId,
        state: result.state,
        status: 'completed',
        orderData: pendingPayment.orderData
      };
    } catch (error) {
      throw new Error(`Payment execution failed: ${error.message}`);
    }
  }

  async handlePaymentWebhook(webhookData) {
    const { event_type, resource } = webhookData;

    switch (event_type) {
      case 'PAYMENT.SALE.COMPLETED':
        await this.handlePaymentCompleted(resource);
        break;
      
      case 'PAYMENT.SALE.DENIED':
        await this.handlePaymentDenied(resource);
        break;
      
      case 'PAYMENT.SALE.REFUNDED':
        await this.handlePaymentRefunded(resource);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event_type}`);
    }
  }
}
```

---

### Payment Validation Component

Validates payment data and ensures security compliance.

#### Purpose
- Input validation for payment data
- Security checks and fraud prevention
- Compliance verification

#### Interface

```javascript
class PaymentValidator {
  static validatePaymentData(paymentData)
  static validateAmount(amount, currency)
  static validateItems(items)
  static sanitizePaymentData(paymentData)
}
```

#### Usage Examples

**Payment Data Validation:**
```javascript
class SecurePaymentValidator extends PaymentValidator {
  static validatePaymentData(paymentData) {
    const errors = [];

    // Validate required fields
    if (!paymentData.items || !Array.isArray(paymentData.items)) {
      errors.push('Items array is required');
    }

    if (!paymentData.total || isNaN(parseFloat(paymentData.total))) {
      errors.push('Valid total amount is required');
    }

    // Validate items
    if (paymentData.items) {
      paymentData.items.forEach((item, index) => {
        if (!item.name || typeof item.name !== 'string') {
          errors.push(`Item ${index}: name is required`);
        }

        if (!item.price || isNaN(parseFloat(item.price))) {
          errors.push(`Item ${index}: valid price is required`);
        }

        if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity <= 0) {
          errors.push(`Item ${index}: valid quantity is required`);
        }
      });
    }

    // Validate total matches items
    if (paymentData.items && paymentData.total) {
      const calculatedTotal = paymentData.items.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * item.quantity);
      }, 0);

      if (Math.abs(calculatedTotal - parseFloat(paymentData.total)) > 0.01) {
        errors.push('Total amount does not match sum of items');
      }
    }

    // Security checks
    if (parseFloat(paymentData.total) > 10000) {
      errors.push('Amount exceeds maximum allowed limit');
    }

    if (errors.length > 0) {
      throw new Error(`Payment validation failed: ${errors.join(', ')}`);
    }

    return true;
  }

  static sanitizePaymentData(paymentData) {
    return {
      items: paymentData.items.map(item => ({
        name: String(item.name).trim().substring(0, 127),
        sku: item.sku ? String(item.sku).trim().substring(0, 127) : undefined,
        price: parseFloat(item.price).toFixed(2),
        currency: (item.currency || 'USD').toUpperCase(),
        quantity: Math.max(1, parseInt(item.quantity))
      })),
      total: parseFloat(paymentData.total).toFixed(2),
      currency: (paymentData.currency || 'USD').toUpperCase(),
      description: paymentData.description ? String(paymentData.description).trim().substring(0, 255) : 'LEGENDO SYNC Payment',
      returnUrl: paymentData.returnUrl || `${process.env.BASE_URL}/payment/success`,
      cancelUrl: paymentData.cancelUrl || `${process.env.BASE_URL}/payment/cancel`
    };
  }
}
```

---

## Middleware Components

### Rate Limiting Middleware

Implements intelligent rate limiting with multiple strategies.

#### Purpose
- Prevent API abuse
- Implement fair usage policies
- Protect against DDoS attacks

#### Configuration

```javascript
const rateLimitConfig = {
  windowMs: 60 * 1000,        // 1 minute window
  max: 10,                    // 10 requests per window
  message: 'Too many requests',
  standardHeaders: true,       // Return rate limit info in headers
  legacyHeaders: false,       // Disable X-RateLimit-* headers
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
};
```

#### Advanced Rate Limiting

```javascript
class AdaptiveRateLimiter {
  constructor() {
    this.limits = new Map();
    this.violations = new Map();
  }

  createLimiter(key, options) {
    const limiter = new RateLimiterMemory({
      keyGenerator: options.keyGenerator || ((req) => req.ip),
      points: options.points || 10,
      duration: options.duration || 60,
      blockDuration: options.blockDuration || 60
    });

    this.limits.set(key, limiter);
    return limiter;
  }

  async checkLimit(req, res, next) {
    const key = this.getKeyForRequest(req);
    const limiter = this.limits.get(key) || this.createDefaultLimiter();

    try {
      await limiter.consume(req.ip);
      
      // Reset violation count on successful request
      this.violations.delete(req.ip);
      
      next();
    } catch (rejRes) {
      // Track violations for adaptive limiting
      const violations = this.violations.get(req.ip) || 0;
      this.violations.set(req.ip, violations + 1);

      // Increase block duration for repeat offenders
      const blockDuration = Math.min(3600, 60 * Math.pow(2, violations));

      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: blockDuration,
        violations: violations + 1
      });
    }
  }

  getKeyForRequest(req) {
    // Different limits for different endpoints
    if (req.path.startsWith('/paypal/')) return 'paypal';
    if (req.path.startsWith('/sync')) return 'sync';
    if (req.path.startsWith('/trigger')) return 'ai';
    return 'default';
  }
}
```

---

### Security Middleware

Comprehensive security middleware stack.

#### Purpose
- HTTP security headers
- Input sanitization
- CORS configuration
- Request validation

#### Implementation

```javascript
class SecurityMiddleware {
  static helmet() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://api.paypal.com", "https://api.sandbox.paypal.com"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    });
  }

  static cors() {
    return cors({
      origin: (origin, callback) => {
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
        
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    });
  }

  static inputSanitization() {
    return (req, res, next) => {
      // Sanitize request body
      if (req.body) {
        req.body = this.sanitizeObject(req.body);
      }

      // Sanitize query parameters
      if (req.query) {
        req.query = this.sanitizeObject(req.query);
      }

      next();
    };
  }

  static sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Remove potentially dangerous characters
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => this.sanitizeObject(item));
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
```

---

## Utility Components

### Logger Component

Comprehensive logging system with multiple transports and log levels.

#### Purpose
- Structured logging
- Multiple output formats
- Error tracking
- Performance monitoring

#### Configuration

```javascript
const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 10
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
};
```

#### Advanced Logging Features

```javascript
class AdvancedLogger {
  constructor() {
    this.logger = winston.createLogger(loggerConfig);
    this.performanceMetrics = new Map();
  }

  // Performance tracking
  startTimer(operation) {
    const start = process.hrtime.bigint();
    this.performanceMetrics.set(operation, start);
    
    this.logger.info(`Started operation: ${operation}`);
    
    return {
      end: () => {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // Convert to milliseconds
        
        this.performanceMetrics.delete(operation);
        this.logger.info(`Completed operation: ${operation}`, { duration });
        
        return duration;
      }
    };
  }

  // Structured logging with context
  logWithContext(level, message, context = {}) {
    this.logger.log(level, message, {
      ...context,
      timestamp: new Date().toISOString(),
      pid: process.pid,
      memory: process.memoryUsage()
    });
  }

  // Error logging with stack traces
  logError(error, context = {}) {
    this.logger.error(error.message, {
      ...context,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
  }

  // Audit logging for security events
  logAudit(event, details = {}) {
    this.logger.info(`AUDIT: ${event}`, {
      ...details,
      type: 'audit',
      timestamp: new Date().toISOString()
    });
  }
}

// Usage example
const logger = new AdvancedLogger();

// Performance tracking
const timer = logger.startTimer('asset-sync');
// ... perform operation
const duration = timer.end();

// Structured logging
logger.logWithContext('info', 'User authentication', {
  userId: 'user-123',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
});

// Error logging
try {
  // ... some operation
} catch (error) {
  logger.logError(error, { operation: 'paypal-payment', paymentId: 'PAY-123' });
}

// Audit logging
logger.logAudit('SENSITIVE_DATA_ACCESS', {
  userId: 'user-123',
  resource: 'financial-report',
  action: 'read'
});
```

---

### Health Check Component

Comprehensive health monitoring system.

#### Purpose
- System health monitoring
- Dependency checks
- Performance metrics
- Alerting integration

#### Implementation

```javascript
class HealthCheckComponent {
  constructor() {
    this.checks = new Map();
    this.metrics = {
      uptime: process.uptime(),
      requests: 0,
      errors: 0,
      lastCheck: new Date().toISOString()
    };
  }

  // Register health checks
  registerCheck(name, checkFunction, options = {}) {
    this.checks.set(name, {
      fn: checkFunction,
      timeout: options.timeout || 5000,
      critical: options.critical || false,
      interval: options.interval || 30000
    });

    // Schedule periodic checks if interval specified
    if (options.interval) {
      setInterval(() => {
        this.runCheck(name);
      }, options.interval);
    }
  }

  // Run individual health check
  async runCheck(name) {
    const check = this.checks.get(name);
    if (!check) return null;

    const start = Date.now();
    
    try {
      const result = await Promise.race([
        check.fn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Check timeout')), check.timeout)
        )
      ]);

      return {
        name,
        status: 'healthy',
        duration: Date.now() - start,
        result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name,
        status: 'unhealthy',
        duration: Date.now() - start,
        error: error.message,
        timestamp: new Date().toISOString(),
        critical: check.critical
      };
    }
  }

  // Run all health checks
  async runAllChecks() {
    const results = [];
    const promises = Array.from(this.checks.keys()).map(name => this.runCheck(name));
    
    const checkResults = await Promise.allSettled(promises);
    
    checkResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          name: Array.from(this.checks.keys())[index],
          status: 'error',
          error: result.reason.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    const overallStatus = results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy';
    const criticalFailures = results.filter(r => r.status === 'unhealthy' && r.critical);

    return {
      status: criticalFailures.length > 0 ? 'critical' : overallStatus,
      checks: results,
      summary: {
        total: results.length,
        healthy: results.filter(r => r.status === 'healthy').length,
        unhealthy: results.filter(r => r.status === 'unhealthy').length,
        critical: criticalFailures.length
      },
      timestamp: new Date().toISOString()
    };
  }

  // Get system metrics
  getSystemMetrics() {
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      timestamp: new Date().toISOString()
    };
  }
}

// Usage example
const healthCheck = new HealthCheckComponent();

// Register health checks
healthCheck.registerCheck('database', async () => {
  // Check database connectivity
  return { connected: true, responseTime: 45 };
}, { critical: true, timeout: 3000 });

healthCheck.registerCheck('paypal', async () => {
  // Check PayPal API connectivity
  const response = await fetch('https://api.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: { 'Accept': 'application/json' }
  });
  return { status: response.status, available: response.ok };
}, { critical: false, timeout: 5000 });

healthCheck.registerCheck('memory', async () => {
  const usage = process.memoryUsage();
  const threshold = 500 * 1024 * 1024; // 500MB
  
  return {
    usage: usage.heapUsed,
    threshold,
    withinLimits: usage.heapUsed < threshold
  };
}, { critical: true });
```

## Configuration Components

### Environment Configuration Manager

Manages all environment variables and configuration settings.

#### Purpose
- Centralized configuration management
- Environment validation
- Default value handling
- Configuration hot-reloading

#### Implementation

```javascript
class ConfigurationManager {
  constructor() {
    this.config = {};
    this.validators = new Map();
    this.loadConfiguration();
  }

  loadConfiguration() {
    this.config = {
      server: {
        port: this.getEnvVar('PORT', 3000, 'number'),
        host: this.getEnvVar('HOST', '0.0.0.0', 'string'),
        environment: this.getEnvVar('NODE_ENV', 'development', 'string')
      },
      
      paypal: {
        mode: this.getEnvVar('PAYPAL_MODE', 'sandbox', 'string'),
        clientId: this.getEnvVar('PAYPAL_CLIENT_ID', null, 'string', true),
        clientSecret: this.getEnvVar('PAYPAL_CLIENT_SECRET', null, 'string', true),
        email: this.getEnvVar('PAYPAL_EMAIL', null, 'string', false)
      },
      
      security: {
        encryptionKey: this.getEnvVar('ENCRYPTION_KEY', null, 'string', false),
        allowedOrigins: this.getEnvVar('ALLOWED_ORIGINS', 'http://localhost:3000', 'array'),
        rateLimitWindow: this.getEnvVar('RATE_LIMIT_WINDOW', 60000, 'number'),
        rateLimitMax: this.getEnvVar('RATE_LIMIT_MAX', 10, 'number')
      },
      
      logging: {
        level: this.getEnvVar('LOG_LEVEL', 'info', 'string'),
        maxFiles: this.getEnvVar('LOG_MAX_FILES', 5, 'number'),
        maxSize: this.getEnvVar('LOG_MAX_SIZE', 5242880, 'number')
      }
    };

    this.validateConfiguration();
  }

  getEnvVar(name, defaultValue, type = 'string', required = false) {
    const value = process.env[name];
    
    if (required && !value) {
      throw new Error(`Required environment variable ${name} is not set`);
    }
    
    if (!value) return defaultValue;
    
    switch (type) {
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`Environment variable ${name} must be a number`);
        }
        return num;
      
      case 'boolean':
        return value.toLowerCase() === 'true';
      
      case 'array':
        return value.split(',').map(item => item.trim());
      
      case 'json':
        try {
          return JSON.parse(value);
        } catch (error) {
          throw new Error(`Environment variable ${name} must be valid JSON`);
        }
      
      default:
        return value;
    }
  }

  validateConfiguration() {
    // Validate PayPal configuration
    if (this.config.paypal.mode === 'live' && !this.config.paypal.clientId) {
      throw new Error('PayPal Client ID is required for live mode');
    }

    // Validate security configuration
    if (this.config.server.environment === 'production') {
      if (!this.config.security.encryptionKey) {
        console.warn('WARNING: No encryption key set for production environment');
      }
      
      if (this.config.security.allowedOrigins.includes('*')) {
        throw new Error('Wildcard CORS origins not allowed in production');
      }
    }

    // Validate logging configuration
    if (!['error', 'warn', 'info', 'debug'].includes(this.config.logging.level)) {
      throw new Error('Invalid log level specified');
    }
  }

  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config);
  }

  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => obj[key] = obj[key] || {}, this.config);
    target[lastKey] = value;
  }

  // Hot reload configuration
  reloadConfiguration() {
    try {
      delete require.cache[require.resolve('dotenv')];
      require('dotenv').config();
      this.loadConfiguration();
      console.log('Configuration reloaded successfully');
    } catch (error) {
      console.error('Failed to reload configuration:', error.message);
      throw error;
    }
  }
}

// Usage example
const config = new ConfigurationManager();

// Get configuration values
const port = config.get('server.port');
const paypalMode = config.get('paypal.mode');
const logLevel = config.get('logging.level');

// Set configuration values
config.set('server.port', 4000);

// Reload configuration
config.reloadConfiguration();
```

This comprehensive documentation covers all the major components in the LEGENDO SYNC system, providing detailed information about their purpose, interfaces, usage examples, and integration patterns. Each component is designed to work together to provide a secure, scalable, and maintainable system for AI execution, asset synchronization, and PayPal payment processing.