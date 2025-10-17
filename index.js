/**
 * LEGENDO SYNC - Vault-grade AI executor for asset sync and PayPal injection
 * 
 * This module provides a secure, high-performance API for managing asset synchronization
 * and PayPal payment processing with AI-driven execution capabilities.
 * 
 * @author LEGENDO Team
 * @version 1.0.0
 */

const express = require('express');
const paypal = require('paypal-rest-sdk');
const dotenv = require('dotenv');
const crypto = require('crypto');
const winston = require('winston');
const helmet = require('helmet');
const cors = require('cors');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Rate limiter configuration
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting middleware
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.'
    });
  }
});

// Configure PayPal SDK
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET
});

/**
 * LegendoSync - Main class for handling AI execution and asset synchronization
 */
class LegendoSync {
  constructor() {
    this.sessions = new Map();
    this.assetCache = new Map();
    this.encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encrypts sensitive data using AES-256-GCM
   * @param {string} text - Text to encrypt
   * @returns {object} Encrypted data with IV and auth tag
   */
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypts data encrypted with encrypt method
   * @param {object} encryptedData - Object containing encrypted data, IV, and auth tag
   * @returns {string} Decrypted text
   */
  decrypt(encryptedData) {
    const decipher = crypto.createDecipher('aes-256-gcm', this.encryptionKey);
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Processes AI execution requests with vault-grade security
   * @param {string} input - Input command or data
   * @param {object} options - Execution options
   * @returns {Promise<object>} Execution result
   */
  async executeAI(input, options = {}) {
    const sessionId = options.sessionId || crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    logger.info(`AI Execution started: ${sessionId}`, { input, options });

    try {
      // Validate input
      if (!input || typeof input !== 'string') {
        throw new Error('Invalid input provided');
      }

      // Process the AI command
      const result = await this.processCommand(input, options);
      
      // Store session data
      this.sessions.set(sessionId, {
        input,
        result,
        timestamp,
        options
      });

      logger.info(`AI Execution completed: ${sessionId}`, { result });

      return {
        sessionId,
        timestamp,
        status: 'success',
        result,
        metadata: {
          processingTime: Date.now() - new Date(timestamp).getTime(),
          inputLength: input.length
        }
      };
    } catch (error) {
      logger.error(`AI Execution failed: ${sessionId}`, { error: error.message });
      
      return {
        sessionId,
        timestamp,
        status: 'error',
        error: error.message,
        code: error.code || 'EXECUTION_ERROR'
      };
    }
  }

  /**
   * Processes individual commands with AI logic
   * @private
   * @param {string} command - Command to process
   * @param {object} options - Processing options
   * @returns {Promise<object>} Processing result
   */
  async processCommand(command, options) {
    // Simulate AI processing logic
    const commands = {
      'HALO BA LEGENDO': () => ({
        message: 'LEGENDO SYNC activated successfully',
        status: 'active',
        capabilities: ['asset_sync', 'paypal_injection', 'vault_security']
      }),
      'SYNC_ASSETS': () => this.syncAssets(options.assets || []),
      'PAYPAL_INJECT': () => this.injectPayPal(options.paypalData || {}),
      'VAULT_STATUS': () => this.getVaultStatus(),
      'HEALTH_CHECK': () => ({ status: 'healthy', timestamp: new Date().toISOString() })
    };

    const normalizedCommand = command.toUpperCase().trim();
    
    if (commands[normalizedCommand]) {
      return await commands[normalizedCommand]();
    }

    // Default AI response for unknown commands
    return {
      message: `Command processed: ${command}`,
      suggestion: 'Available commands: HALO BA LEGENDO, SYNC_ASSETS, PAYPAL_INJECT, VAULT_STATUS, HEALTH_CHECK',
      processed: true
    };
  }

  /**
   * Synchronizes assets with vault-grade security
   * @param {Array} assets - Array of asset objects to sync
   * @returns {Promise<object>} Sync result
   */
  async syncAssets(assets) {
    logger.info('Asset sync initiated', { assetCount: assets.length });

    const syncResults = [];
    
    for (const asset of assets) {
      try {
        // Encrypt asset data
        const encryptedAsset = this.encrypt(JSON.stringify(asset));
        
        // Store in cache
        const assetId = crypto.randomUUID();
        this.assetCache.set(assetId, {
          ...encryptedAsset,
          timestamp: new Date().toISOString(),
          originalHash: crypto.createHash('sha256').update(JSON.stringify(asset)).digest('hex')
        });

        syncResults.push({
          assetId,
          status: 'synced',
          hash: crypto.createHash('sha256').update(JSON.stringify(asset)).digest('hex')
        });
      } catch (error) {
        syncResults.push({
          asset,
          status: 'failed',
          error: error.message
        });
      }
    }

    return {
      totalAssets: assets.length,
      syncedAssets: syncResults.filter(r => r.status === 'synced').length,
      failedAssets: syncResults.filter(r => r.status === 'failed').length,
      results: syncResults
    };
  }

  /**
   * Injects PayPal payment processing capabilities
   * @param {object} paypalData - PayPal configuration and payment data
   * @returns {Promise<object>} Injection result
   */
  async injectPayPal(paypalData) {
    logger.info('PayPal injection initiated', { hasData: !!paypalData });

    try {
      if (paypalData.createPayment) {
        return await this.createPayPalPayment(paypalData.createPayment);
      }

      if (paypalData.executePayment) {
        return await this.executePayPalPayment(paypalData.executePayment);
      }

      return {
        status: 'injected',
        message: 'PayPal capabilities activated',
        availableActions: ['createPayment', 'executePayment', 'getPaymentDetails']
      };
    } catch (error) {
      logger.error('PayPal injection failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Creates a PayPal payment
   * @param {object} paymentData - Payment configuration
   * @returns {Promise<object>} Payment creation result
   */
  async createPayPalPayment(paymentData) {
    return new Promise((resolve, reject) => {
      const payment = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal'
        },
        redirect_urls: {
          return_url: paymentData.returnUrl || 'http://localhost:3000/success',
          cancel_url: paymentData.cancelUrl || 'http://localhost:3000/cancel'
        },
        transactions: [{
          item_list: {
            items: paymentData.items || []
          },
          amount: {
            currency: paymentData.currency || 'USD',
            total: paymentData.total || '0.00'
          },
          description: paymentData.description || 'LEGENDO SYNC Payment'
        }]
      };

      paypal.payment.create(payment, (error, payment) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            paymentId: payment.id,
            approvalUrl: payment.links.find(link => link.rel === 'approval_url').href,
            status: 'created'
          });
        }
      });
    });
  }

  /**
   * Executes a PayPal payment
   * @param {object} executionData - Payment execution data
   * @returns {Promise<object>} Payment execution result
   */
  async executePayPalPayment(executionData) {
    return new Promise((resolve, reject) => {
      const execute_payment_json = {
        payer_id: executionData.payerId
      };

      paypal.payment.execute(executionData.paymentId, execute_payment_json, (error, payment) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            paymentId: payment.id,
            state: payment.state,
            status: 'executed'
          });
        }
      });
    });
  }

  /**
   * Gets current vault status and security metrics
   * @returns {object} Vault status information
   */
  getVaultStatus() {
    return {
      status: 'secure',
      activeSessions: this.sessions.size,
      cachedAssets: this.assetCache.size,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      securityLevel: 'vault-grade',
      lastHealthCheck: new Date().toISOString()
    };
  }

  /**
   * Retrieves session data by ID
   * @param {string} sessionId - Session identifier
   * @returns {object|null} Session data or null if not found
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Clears expired sessions and cached assets
   * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
   */
  cleanup(maxAge = 3600000) {
    const now = Date.now();
    
    // Clean up sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - new Date(session.timestamp).getTime() > maxAge) {
        this.sessions.delete(sessionId);
      }
    }

    // Clean up asset cache
    for (const [assetId, asset] of this.assetCache.entries()) {
      if (now - new Date(asset.timestamp).getTime() > maxAge) {
        this.assetCache.delete(assetId);
      }
    }

    logger.info('Cleanup completed', {
      activeSessions: this.sessions.size,
      cachedAssets: this.assetCache.size
    });
  }
}

// Initialize LEGENDO SYNC instance
const legendoSync = new LegendoSync();

// Cleanup interval (every 30 minutes)
setInterval(() => {
  legendoSync.cleanup();
}, 1800000);

// API Routes

/**
 * Health check endpoint
 * @route GET /health
 * @returns {object} Health status
 */
app.get('/health', (req, res) => {
  const status = legendoSync.getVaultStatus();
  res.json({
    status: 'healthy',
    service: 'LEGENDO SYNC',
    version: '1.0.0',
    ...status
  });
});

/**
 * Main trigger endpoint for AI execution
 * @route POST /trigger
 * @param {string} input - Command or data to process
 * @param {object} options - Execution options
 * @returns {object} Execution result
 */
app.post('/trigger', async (req, res) => {
  try {
    const { input, options = {} } = req.body;
    
    if (!input) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Input parameter is required'
      });
    }

    const result = await legendoSync.executeAI(input, options);
    
    res.json(result);
  } catch (error) {
    logger.error('Trigger endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while processing your request'
    });
  }
});

/**
 * Asset synchronization endpoint
 * @route POST /sync
 * @param {Array} assets - Assets to synchronize
 * @returns {object} Sync result
 */
app.post('/sync', async (req, res) => {
  try {
    const { assets = [] } = req.body;
    
    const result = await legendoSync.syncAssets(assets);
    
    res.json({
      status: 'success',
      ...result
    });
  } catch (error) {
    logger.error('Sync endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Asset synchronization failed'
    });
  }
});

/**
 * PayPal payment creation endpoint
 * @route POST /paypal/create
 * @param {object} paymentData - Payment configuration
 * @returns {object} Payment creation result
 */
app.post('/paypal/create', async (req, res) => {
  try {
    const result = await legendoSync.injectPayPal({
      createPayment: req.body
    });
    
    res.json(result);
  } catch (error) {
    logger.error('PayPal create endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Payment Creation Failed',
      message: error.message
    });
  }
});

/**
 * PayPal payment execution endpoint
 * @route POST /paypal/execute
 * @param {string} paymentId - PayPal payment ID
 * @param {string} payerId - PayPal payer ID
 * @returns {object} Payment execution result
 */
app.post('/paypal/execute', async (req, res) => {
  try {
    const { paymentId, payerId } = req.body;
    
    if (!paymentId || !payerId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'paymentId and payerId are required'
      });
    }

    const result = await legendoSync.injectPayPal({
      executePayment: { paymentId, payerId }
    });
    
    res.json(result);
  } catch (error) {
    logger.error('PayPal execute endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Payment Execution Failed',
      message: error.message
    });
  }
});

/**
 * Session retrieval endpoint
 * @route GET /session/:sessionId
 * @param {string} sessionId - Session identifier
 * @returns {object} Session data
 */
app.get('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = legendoSync.getSession(sessionId);
  
  if (!session) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Session not found or expired'
    });
  }
  
  res.json(session);
});

/**
 * Vault status endpoint
 * @route GET /vault/status
 * @returns {object} Detailed vault status
 */
app.get('/vault/status', (req, res) => {
  const status = legendoSync.getVaultStatus();
  res.json(status);
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error', { error: error.message, stack: error.stack });
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`LEGENDO SYNC running on port ${PORT}`);
  console.log(`🚀 LEGENDO SYNC running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI Trigger: POST http://localhost:${PORT}/trigger`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Export for testing
module.exports = { app, LegendoSync, legendoSync };