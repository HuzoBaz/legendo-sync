/**
 * LEGENDO SYNC - Vault-grade AI executor for asset sync and PayPal injection
 * @module legendo-sync
 * @version 1.0.0
 * @description A secure Express.js server for handling asset synchronization and PayPal payment processing
 */

require('dotenv').config();
const express = require('express');
const paypal = require('paypal-rest-sdk');

// Initialize Express app
const app = express();
app.use(express.json());

// PayPal Configuration
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox', // sandbox or live
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET
});

/**
 * Logger utility for standardized logging
 * @class Logger
 */
class Logger {
  /**
   * Log info message
   * @param {string} message - Message to log
   * @param {Object} [data] - Additional data to log
   */
  static info(message, data = {}) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Error} [error] - Error object
   */
  static error(message, error = null) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} [data] - Additional data
   */
  static warn(message, data = {}) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
  }
}

/**
 * PayPal Service for handling payment operations
 * @class PayPalService
 */
class PayPalService {
  /**
   * Create a PayPal payment
   * @param {number} amount - Payment amount
   * @param {string} currency - Currency code (e.g., 'USD')
   * @param {string} description - Payment description
   * @returns {Promise<Object>} Payment creation result
   * @throws {Error} If payment creation fails
   */
  static async createPayment(amount, currency = 'USD', description = 'LEGENDO SYNC Payment') {
    return new Promise((resolve, reject) => {
      const create_payment_json = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal'
        },
        redirect_urls: {
          return_url: process.env.PAYPAL_RETURN_URL || 'http://localhost:3000/success',
          cancel_url: process.env.PAYPAL_CANCEL_URL || 'http://localhost:3000/cancel'
        },
        transactions: [{
          item_list: {
            items: [{
              name: 'LEGENDO SYNC Service',
              sku: 'LS001',
              price: amount.toFixed(2),
              currency: currency,
              quantity: 1
            }]
          },
          amount: {
            currency: currency,
            total: amount.toFixed(2)
          },
          description: description
        }]
      };

      paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
          Logger.error('PayPal payment creation failed', error);
          reject(error);
        } else {
          Logger.info('PayPal payment created', { paymentId: payment.id });
          resolve(payment);
        }
      });
    });
  }

  /**
   * Execute a PayPal payment
   * @param {string} paymentId - Payment ID from PayPal
   * @param {string} payerId - Payer ID from PayPal
   * @returns {Promise<Object>} Payment execution result
   * @throws {Error} If payment execution fails
   */
  static async executePayment(paymentId, payerId) {
    return new Promise((resolve, reject) => {
      const execute_payment_json = {
        payer_id: payerId
      };

      paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
        if (error) {
          Logger.error('PayPal payment execution failed', error);
          reject(error);
        } else {
          Logger.info('PayPal payment executed successfully', { paymentId: payment.id });
          resolve(payment);
        }
      });
    });
  }

  /**
   * Get payment details
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Payment details
   * @throws {Error} If retrieval fails
   */
  static async getPaymentDetails(paymentId) {
    return new Promise((resolve, reject) => {
      paypal.payment.get(paymentId, (error, payment) => {
        if (error) {
          Logger.error('Failed to retrieve payment details', error);
          reject(error);
        } else {
          resolve(payment);
        }
      });
    });
  }
}

/**
 * Asset Sync Service for managing asset synchronization
 * @class AssetSyncService
 */
class AssetSyncService {
  /**
   * Initialize asset synchronization
   * @param {string} input - Input data for synchronization
   * @returns {Promise<Object>} Sync result
   */
  static async initSync(input) {
    Logger.info('Initiating asset sync', { input });
    
    // Simulate asset sync process
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = {
          status: 'success',
          message: 'Asset sync completed',
          input: input,
          syncId: `SYNC-${Date.now()}`,
          timestamp: new Date().toISOString()
        };
        Logger.info('Asset sync completed', result);
        resolve(result);
      }, 1000);
    });
  }

  /**
   * Get sync status
   * @param {string} syncId - Sync ID to check
   * @returns {Promise<Object>} Sync status
   */
  static async getSyncStatus(syncId) {
    Logger.info('Checking sync status', { syncId });
    return {
      syncId: syncId,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Middleware for request validation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function validateRequest(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (process.env.REQUIRE_API_KEY === 'true' && !apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key required'
    });
  }
  
  next();
}

/**
 * Middleware for error handling
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function errorHandler(err, req, res, next) {
  Logger.error('Request error', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
}

// ==================== API ROUTES ====================

/**
 * Health check endpoint
 * @route GET /health
 * @returns {Object} 200 - Health status
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'LEGENDO SYNC',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Trigger asset synchronization
 * @route POST /trigger
 * @param {string} req.body.input - Input data for sync operation
 * @returns {Object} 200 - Sync result
 * @returns {Object} 400 - Bad request
 * @example
 * POST /trigger
 * {
 *   "input": "HALO BA LEGENDO"
 * }
 */
app.post('/trigger', validateRequest, async (req, res, next) => {
  try {
    const { input } = req.body;
    
    if (!input) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Input parameter is required'
      });
    }

    const result = await AssetSyncService.initSync(input);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Get synchronization status
 * @route GET /sync/:syncId
 * @param {string} req.params.syncId - Sync ID to check
 * @returns {Object} 200 - Sync status
 * @example
 * GET /sync/SYNC-1234567890
 */
app.get('/sync/:syncId', validateRequest, async (req, res, next) => {
  try {
    const { syncId } = req.params;
    const status = await AssetSyncService.getSyncStatus(syncId);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

/**
 * Create PayPal payment
 * @route POST /payment/create
 * @param {number} req.body.amount - Payment amount
 * @param {string} req.body.currency - Currency code (default: USD)
 * @param {string} req.body.description - Payment description
 * @returns {Object} 200 - Payment creation result with approval URL
 * @returns {Object} 400 - Bad request
 * @example
 * POST /payment/create
 * {
 *   "amount": 10.00,
 *   "currency": "USD",
 *   "description": "Asset Sync Service"
 * }
 */
app.post('/payment/create', validateRequest, async (req, res, next) => {
  try {
    const { amount, currency = 'USD', description = 'LEGENDO SYNC Payment' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Valid amount is required'
      });
    }

    const payment = await PayPalService.createPayment(amount, currency, description);
    
    // Extract approval URL
    const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
    
    res.json({
      paymentId: payment.id,
      approvalUrl: approvalUrl ? approvalUrl.href : null,
      status: payment.state,
      amount: amount,
      currency: currency
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Execute PayPal payment
 * @route POST /payment/execute
 * @param {string} req.body.paymentId - Payment ID from PayPal
 * @param {string} req.body.payerId - Payer ID from PayPal
 * @returns {Object} 200 - Payment execution result
 * @returns {Object} 400 - Bad request
 * @example
 * POST /payment/execute
 * {
 *   "paymentId": "PAYID-XXXXXX",
 *   "payerId": "PAYERID123"
 * }
 */
app.post('/payment/execute', validateRequest, async (req, res, next) => {
  try {
    const { paymentId, payerId } = req.body;
    
    if (!paymentId || !payerId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'paymentId and payerId are required'
      });
    }

    const result = await PayPalService.executePayment(paymentId, payerId);
    
    res.json({
      status: 'success',
      paymentId: result.id,
      state: result.state,
      payer: result.payer,
      transactions: result.transactions
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get payment details
 * @route GET /payment/:paymentId
 * @param {string} req.params.paymentId - Payment ID
 * @returns {Object} 200 - Payment details
 * @example
 * GET /payment/PAYID-XXXXXX
 */
app.get('/payment/:paymentId', validateRequest, async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const payment = await PayPalService.getPaymentDetails(paymentId);
    res.json(payment);
  } catch (error) {
    next(error);
  }
});

/**
 * Payment success callback
 * @route GET /success
 * @param {string} req.query.paymentId - Payment ID
 * @param {string} req.query.PayerID - Payer ID
 * @returns {Object} 200 - Success page
 */
app.get('/success', (req, res) => {
  const { paymentId, PayerID } = req.query;
  res.json({
    message: 'Payment successful',
    paymentId: paymentId,
    payerId: PayerID,
    instructions: 'Use POST /payment/execute to complete the payment'
  });
});

/**
 * Payment cancel callback
 * @route GET /cancel
 * @returns {Object} 200 - Cancellation message
 */
app.get('/cancel', (req, res) => {
  res.json({
    message: 'Payment cancelled',
    timestamp: new Date().toISOString()
  });
});

// Apply error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  Logger.info(`LEGENDO SYNC running on port ${PORT}`);
  Logger.info('Available endpoints:', {
    health: `http://localhost:${PORT}/health`,
    trigger: `http://localhost:${PORT}/trigger`,
    payment: `http://localhost:${PORT}/payment/create`
  });
});

/**
 * Graceful shutdown handler
 * @param {string} signal - Shutdown signal
 */
function gracefulShutdown(signal) {
  Logger.info(`Received ${signal}, starting graceful shutdown...`);
  server.close(() => {
    Logger.info('Server closed successfully');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    Logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Export for testing
module.exports = { app, PayPalService, AssetSyncService, Logger };
