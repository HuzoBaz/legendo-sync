# LEGENDO SYNC Examples

This document provides comprehensive examples for integrating and using LEGENDO SYNC in various scenarios and programming languages.

## Table of Contents

- [Quick Start Examples](#quick-start-examples)
- [JavaScript/Node.js Examples](#javascriptnodejs-examples)
- [Python Examples](#python-examples)
- [React Frontend Examples](#react-frontend-examples)
- [cURL Examples](#curl-examples)
- [Advanced Integration Examples](#advanced-integration-examples)
- [Error Handling Examples](#error-handling-examples)
- [Testing Examples](#testing-examples)

## Quick Start Examples

### Basic Server Setup

```bash
# Clone and setup
git clone https://github.com/HuzoBaz/legendo-sync.git
cd legendo-sync
npm install

# Configure environment
cp .env.example .env
# Edit .env with your PayPal credentials

# Start server
npm start
```

### First API Call

```bash
# Test the service is running
curl http://localhost:3000/health

# Execute basic AI command
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}'
```

## JavaScript/Node.js Examples

### Complete Client Implementation

```javascript
const axios = require('axios');
const crypto = require('crypto');

class LegendoSyncClient {
  constructor(options = {}) {
    this.baseURL = options.baseURL || 'http://localhost:3000';
    this.timeout = options.timeout || 30000;
    this.retryAttempts = options.retryAttempts || 3;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LegendoSync-Client/1.0.0'
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making request to ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 429) {
          // Handle rate limiting with exponential backoff
          const retryAfter = error.response.headers['retry-after'] || 60;
          console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
          await this.sleep(retryAfter * 1000);
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async executeAI(input, options = {}) {
    try {
      const response = await this.client.post('/trigger', {
        input,
        options: {
          sessionId: options.sessionId || crypto.randomUUID(),
          ...options
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'AI execution failed');
    }
  }

  async syncAssets(assets, options = {}) {
    try {
      // Validate assets before sending
      this.validateAssets(assets);
      
      const response = await this.client.post('/sync', { assets });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Asset synchronization failed');
    }
  }

  async createPayment(paymentData) {
    try {
      // Validate payment data
      this.validatePaymentData(paymentData);
      
      const response = await this.client.post('/paypal/create', paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Payment creation failed');
    }
  }

  async executePayment(paymentId, payerId) {
    try {
      const response = await this.client.post('/paypal/execute', {
        paymentId,
        payerId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Payment execution failed');
    }
  }

  async getSession(sessionId) {
    try {
      const response = await this.client.get(`/session/${sessionId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw this.handleError(error, 'Session retrieval failed');
    }
  }

  async getVaultStatus() {
    try {
      const response = await this.client.get('/vault/status');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Vault status retrieval failed');
    }
  }

  async getHealth() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Health check failed');
    }
  }

  validateAssets(assets) {
    if (!Array.isArray(assets)) {
      throw new Error('Assets must be an array');
    }

    assets.forEach((asset, index) => {
      if (!asset.id) {
        throw new Error(`Asset at index ${index} must have an id`);
      }
      if (!asset.type) {
        throw new Error(`Asset at index ${index} must have a type`);
      }
      if (asset.data === undefined) {
        throw new Error(`Asset at index ${index} must have data`);
      }
    });
  }

  validatePaymentData(paymentData) {
    if (!paymentData.items || !Array.isArray(paymentData.items)) {
      throw new Error('Payment data must include items array');
    }

    if (!paymentData.total || isNaN(parseFloat(paymentData.total))) {
      throw new Error('Payment data must include valid total amount');
    }

    paymentData.items.forEach((item, index) => {
      if (!item.name) {
        throw new Error(`Item at index ${index} must have a name`);
      }
      if (!item.price || isNaN(parseFloat(item.price))) {
        throw new Error(`Item at index ${index} must have a valid price`);
      }
      if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error(`Item at index ${index} must have a valid quantity`);
      }
    });
  }

  handleError(error, message) {
    const errorDetails = {
      message,
      originalError: error.message,
      status: error.response?.status,
      data: error.response?.data
    };

    console.error('LegendoSync Client Error:', errorDetails);
    
    const customError = new Error(message);
    customError.details = errorDetails;
    return customError;
  }
}

// Usage Examples
async function examples() {
  const client = new LegendoSyncClient({
    baseURL: 'http://localhost:3000',
    timeout: 10000
  });

  try {
    // 1. Health Check
    console.log('=== Health Check ===');
    const health = await client.getHealth();
    console.log('Service Status:', health.status);

    // 2. AI Execution
    console.log('\n=== AI Execution ===');
    const aiResult = await client.executeAI('HALO BA LEGENDO', {
      sessionId: 'demo-session-001'
    });
    console.log('AI Response:', aiResult.result);

    // 3. Asset Synchronization
    console.log('\n=== Asset Sync ===');
    const assets = [
      {
        id: 'document-001',
        type: 'document',
        data: {
          title: 'Important Document',
          content: 'This is sensitive content that needs to be encrypted',
          version: '1.0'
        },
        metadata: {
          department: 'finance',
          classification: 'confidential'
        }
      },
      {
        id: 'image-001',
        type: 'image',
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        metadata: {
          format: 'png',
          dimensions: '1x1'
        }
      }
    ];

    const syncResult = await client.syncAssets(assets);
    console.log(`Synced ${syncResult.syncedAssets}/${syncResult.totalAssets} assets`);

    // 4. PayPal Payment
    console.log('\n=== PayPal Payment ===');
    const paymentData = {
      items: [
        {
          name: 'LEGENDO Premium Service',
          sku: 'LEG-PREM-001',
          price: '29.99',
          currency: 'USD',
          quantity: 1
        }
      ],
      total: '29.99',
      currency: 'USD',
      description: 'Premium service subscription',
      returnUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel'
    };

    const payment = await client.createPayment(paymentData);
    console.log('Payment created:', payment.paymentId);
    console.log('Approval URL:', payment.approvalUrl);

    // 5. Session Retrieval
    console.log('\n=== Session Retrieval ===');
    const session = await client.getSession('demo-session-001');
    if (session) {
      console.log('Session found:', session.timestamp);
    }

    // 6. Vault Status
    console.log('\n=== Vault Status ===');
    const vaultStatus = await client.getVaultStatus();
    console.log('Security Level:', vaultStatus.securityLevel);
    console.log('Active Sessions:', vaultStatus.activeSessions);

  } catch (error) {
    console.error('Example failed:', error.message);
    if (error.details) {
      console.error('Error details:', error.details);
    }
  }
}

// Run examples
examples();

module.exports = LegendoSyncClient;
```

### Express.js Integration

```javascript
const express = require('express');
const LegendoSyncClient = require('./legendo-sync-client');

const app = express();
app.use(express.json());

const legendoClient = new LegendoSyncClient();

// Middleware to handle LEGENDO SYNC operations
app.use('/api/legendo', async (req, res, next) => {
  try {
    req.legendoClient = legendoClient;
    next();
  } catch (error) {
    res.status(500).json({ error: 'LEGENDO SYNC initialization failed' });
  }
});

// AI processing endpoint
app.post('/api/legendo/ai', async (req, res) => {
  try {
    const { input, options } = req.body;
    const result = await req.legendoClient.executeAI(input, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Asset management endpoint
app.post('/api/legendo/assets', async (req, res) => {
  try {
    const { assets } = req.body;
    const result = await req.legendoClient.syncAssets(assets);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Payment processing endpoints
app.post('/api/legendo/payment/create', async (req, res) => {
  try {
    const payment = await req.legendoClient.createPayment(req.body);
    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/legendo/payment/execute', async (req, res) => {
  try {
    const { paymentId, payerId } = req.body;
    const result = await req.legendoClient.executePayment(paymentId, payerId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(4000, () => {
  console.log('Integration server running on port 4000');
});
```

## Python Examples

### Complete Python Client

```python
import requests
import json
import time
import uuid
from typing import Dict, List, Optional, Any

class LegendoSyncClient:
    def __init__(self, base_url: str = "http://localhost:3000", timeout: int = 30):
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'LegendoSync-Python-Client/1.0.0'
        })

    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> Dict:
        """Make HTTP request with error handling and retries."""
        url = f"{self.base_url}{endpoint}"
        
        for attempt in range(3):  # Retry up to 3 times
            try:
                response = self.session.request(
                    method=method,
                    url=url,
                    json=data,
                    params=params,
                    timeout=self.timeout
                )
                
                if response.status_code == 429:  # Rate limited
                    retry_after = int(response.headers.get('retry-after', 60))
                    print(f"Rate limited. Waiting {retry_after} seconds...")
                    time.sleep(retry_after)
                    continue
                
                response.raise_for_status()
                return response.json()
                
            except requests.exceptions.RequestException as e:
                if attempt == 2:  # Last attempt
                    raise Exception(f"Request failed after 3 attempts: {str(e)}")
                time.sleep(2 ** attempt)  # Exponential backoff
        
        raise Exception("Max retries exceeded")

    def execute_ai(self, input_text: str, options: Optional[Dict] = None) -> Dict:
        """Execute AI command."""
        if options is None:
            options = {}
        
        if 'sessionId' not in options:
            options['sessionId'] = str(uuid.uuid4())
        
        data = {
            'input': input_text,
            'options': options
        }
        
        return self._make_request('POST', '/trigger', data)

    def sync_assets(self, assets: List[Dict]) -> Dict:
        """Synchronize assets."""
        self._validate_assets(assets)
        return self._make_request('POST', '/sync', {'assets': assets})

    def create_payment(self, payment_data: Dict) -> Dict:
        """Create PayPal payment."""
        self._validate_payment_data(payment_data)
        return self._make_request('POST', '/paypal/create', payment_data)

    def execute_payment(self, payment_id: str, payer_id: str) -> Dict:
        """Execute PayPal payment."""
        data = {
            'paymentId': payment_id,
            'payerId': payer_id
        }
        return self._make_request('POST', '/paypal/execute', data)

    def get_session(self, session_id: str) -> Optional[Dict]:
        """Get session data."""
        try:
            return self._make_request('GET', f'/session/{session_id}')
        except Exception as e:
            if '404' in str(e):
                return None
            raise

    def get_vault_status(self) -> Dict:
        """Get vault status."""
        return self._make_request('GET', '/vault/status')

    def get_health(self) -> Dict:
        """Get health status."""
        return self._make_request('GET', '/health')

    def _validate_assets(self, assets: List[Dict]) -> None:
        """Validate asset data."""
        if not isinstance(assets, list):
            raise ValueError("Assets must be a list")
        
        for i, asset in enumerate(assets):
            if not isinstance(asset, dict):
                raise ValueError(f"Asset at index {i} must be a dictionary")
            
            if 'id' not in asset:
                raise ValueError(f"Asset at index {i} must have an 'id' field")
            
            if 'type' not in asset:
                raise ValueError(f"Asset at index {i} must have a 'type' field")
            
            if 'data' not in asset:
                raise ValueError(f"Asset at index {i} must have a 'data' field")

    def _validate_payment_data(self, payment_data: Dict) -> None:
        """Validate payment data."""
        if 'items' not in payment_data or not isinstance(payment_data['items'], list):
            raise ValueError("Payment data must include 'items' list")
        
        if 'total' not in payment_data:
            raise ValueError("Payment data must include 'total' amount")
        
        try:
            float(payment_data['total'])
        except (ValueError, TypeError):
            raise ValueError("Total amount must be a valid number")
        
        for i, item in enumerate(payment_data['items']):
            if 'name' not in item:
                raise ValueError(f"Item at index {i} must have a 'name'")
            
            if 'price' not in item:
                raise ValueError(f"Item at index {i} must have a 'price'")
            
            try:
                float(item['price'])
            except (ValueError, TypeError):
                raise ValueError(f"Item at index {i} price must be a valid number")
            
            if 'quantity' not in item or not isinstance(item['quantity'], int) or item['quantity'] <= 0:
                raise ValueError(f"Item at index {i} must have a valid quantity")


# Usage Examples
def run_examples():
    client = LegendoSyncClient()
    
    try:
        # Health Check
        print("=== Health Check ===")
        health = client.get_health()
        print(f"Service Status: {health['status']}")
        
        # AI Execution
        print("\n=== AI Execution ===")
        ai_result = client.execute_ai("HALO BA LEGENDO", {
            'sessionId': 'python-demo-001'
        })
        print(f"AI Response: {ai_result['result']}")
        
        # Asset Synchronization
        print("\n=== Asset Sync ===")
        assets = [
            {
                'id': 'python-doc-001',
                'type': 'document',
                'data': {
                    'title': 'Python Integration Document',
                    'content': 'This document demonstrates Python integration',
                    'language': 'python'
                },
                'metadata': {
                    'created_by': 'python_client',
                    'version': '1.0'
                }
            }
        ]
        
        sync_result = client.sync_assets(assets)
        print(f"Synced {sync_result['syncedAssets']}/{sync_result['totalAssets']} assets")
        
        # PayPal Payment
        print("\n=== PayPal Payment ===")
        payment_data = {
            'items': [
                {
                    'name': 'Python Integration Service',
                    'sku': 'PY-INT-001',
                    'price': '19.99',
                    'currency': 'USD',
                    'quantity': 1
                }
            ],
            'total': '19.99',
            'currency': 'USD',
            'description': 'Python integration service',
            'returnUrl': 'http://localhost:3000/success',
            'cancelUrl': 'http://localhost:3000/cancel'
        }
        
        payment = client.create_payment(payment_data)
        print(f"Payment created: {payment['paymentId']}")
        print(f"Approval URL: {payment['approvalUrl']}")
        
        # Session Retrieval
        print("\n=== Session Retrieval ===")
        session = client.get_session('python-demo-001')
        if session:
            print(f"Session found: {session['timestamp']}")
        
        # Vault Status
        print("\n=== Vault Status ===")
        vault_status = client.get_vault_status()
        print(f"Security Level: {vault_status['securityLevel']}")
        print(f"Active Sessions: {vault_status['activeSessions']}")
        
    except Exception as e:
        print(f"Example failed: {str(e)}")


# Django Integration Example
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

@csrf_exempt
@require_http_methods(["POST"])
def ai_execute_view(request):
    try:
        data = json.loads(request.body)
        client = LegendoSyncClient()
        
        result = client.execute_ai(
            data.get('input'),
            data.get('options', {})
        )
        
        return JsonResponse(result)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def asset_sync_view(request):
    try:
        data = json.loads(request.body)
        client = LegendoSyncClient()
        
        result = client.sync_assets(data.get('assets', []))
        
        return JsonResponse(result)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


# Flask Integration Example
from flask import Flask, request, jsonify

app = Flask(__name__)
legendo_client = LegendoSyncClient()

@app.route('/api/ai/execute', methods=['POST'])
def ai_execute():
    try:
        data = request.get_json()
        result = legendo_client.execute_ai(
            data.get('input'),
            data.get('options', {})
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assets/sync', methods=['POST'])
def asset_sync():
    try:
        data = request.get_json()
        result = legendo_client.sync_assets(data.get('assets', []))
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    run_examples()
```

## React Frontend Examples

### Complete React Integration

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Custom hook for LEGENDO SYNC integration
const useLegendoSync = (baseURL = 'http://localhost:3000') => {
  const [client] = useState(() => {
    return axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeAI = useCallback(async (input, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await client.post('/trigger', { input, options });
      return response.data;
    } catch (err) {
      const error = err.response?.data?.message || err.message;
      setError(error);
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  }, [client]);

  const syncAssets = useCallback(async (assets) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await client.post('/sync', { assets });
      return response.data;
    } catch (err) {
      const error = err.response?.data?.message || err.message;
      setError(error);
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  }, [client]);

  const createPayment = useCallback(async (paymentData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await client.post('/paypal/create', paymentData);
      return response.data;
    } catch (err) {
      const error = err.response?.data?.message || err.message;
      setError(error);
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  }, [client]);

  const getVaultStatus = useCallback(async () => {
    try {
      const response = await client.get('/vault/status');
      return response.data;
    } catch (err) {
      const error = err.response?.data?.message || err.message;
      setError(error);
      throw new Error(error);
    }
  }, [client]);

  const getHealth = useCallback(async () => {
    try {
      const response = await client.get('/health');
      return response.data;
    } catch (err) {
      const error = err.response?.data?.message || err.message;
      setError(error);
      throw new Error(error);
    }
  }, [client]);

  return {
    executeAI,
    syncAssets,
    createPayment,
    getVaultStatus,
    getHealth,
    loading,
    error
  };
};

// Main Dashboard Component
const LegendoSyncDashboard = () => {
  const {
    executeAI,
    syncAssets,
    createPayment,
    getVaultStatus,
    getHealth,
    loading,
    error
  } = useLegendoSync();

  const [status, setStatus] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [healthData, vaultData] = await Promise.all([
          getHealth(),
          getVaultStatus()
        ]);
        
        setStatus({
          health: healthData,
          vault: vaultData
        });
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, [getHealth, getVaultStatus]);

  // AI Command Execution
  const handleAICommand = async (command) => {
    try {
      const result = await executeAI(command, {
        sessionId: `web-session-${Date.now()}`
      });
      setAiResult(result);
    } catch (error) {
      console.error('AI execution failed:', error);
    }
  };

  // Asset Synchronization
  const handleAssetSync = async () => {
    const assets = [
      {
        id: `web-asset-${Date.now()}`,
        type: 'document',
        data: {
          title: 'Web Dashboard Document',
          content: 'Created from React dashboard',
          timestamp: new Date().toISOString()
        },
        metadata: {
          source: 'web-dashboard',
          user: 'demo-user'
        }
      }
    ];

    try {
      const result = await syncAssets(assets);
      setSyncResult(result);
    } catch (error) {
      console.error('Asset sync failed:', error);
    }
  };

  // Payment Creation
  const handleCreatePayment = async () => {
    const paymentData = {
      items: [
        {
          name: 'Web Dashboard Service',
          sku: 'WEB-DASH-001',
          price: '9.99',
          currency: 'USD',
          quantity: 1
        }
      ],
      total: '9.99',
      currency: 'USD',
      description: 'Web dashboard premium features',
      returnUrl: `${window.location.origin}/payment/success`,
      cancelUrl: `${window.location.origin}/payment/cancel`
    };

    try {
      const result = await createPayment(paymentData);
      setPaymentResult(result);
      
      // Open PayPal approval URL
      if (result.approvalUrl) {
        window.open(result.approvalUrl, '_blank');
      }
    } catch (error) {
      console.error('Payment creation failed:', error);
    }
  };

  return (
    <div className="legendo-dashboard">
      <header className="dashboard-header">
        <h1>LEGENDO SYNC Dashboard</h1>
        {loading && <div className="loading-indicator">Processing...</div>}
        {error && <div className="error-message">Error: {error}</div>}
      </header>

      {/* Status Panel */}
      <section className="status-panel">
        <h2>System Status</h2>
        {status && (
          <div className="status-grid">
            <div className="status-card">
              <h3>Health</h3>
              <p className={`status-badge ${status.health.status}`}>
                {status.health.status}
              </p>
              <p>Version: {status.health.version}</p>
            </div>
            
            <div className="status-card">
              <h3>Vault Security</h3>
              <p className="security-level">{status.vault.securityLevel}</p>
              <p>Active Sessions: {status.vault.activeSessions}</p>
              <p>Cached Assets: {status.vault.cachedAssets}</p>
            </div>
          </div>
        )}
      </section>

      {/* AI Commands Panel */}
      <section className="ai-panel">
        <h2>AI Commands</h2>
        <div className="button-group">
          <button 
            onClick={() => handleAICommand('HALO BA LEGENDO')}
            disabled={loading}
          >
            Activate LEGENDO
          </button>
          <button 
            onClick={() => handleAICommand('VAULT_STATUS')}
            disabled={loading}
          >
            Check Vault
          </button>
          <button 
            onClick={() => handleAICommand('HEALTH_CHECK')}
            disabled={loading}
          >
            Health Check
          </button>
        </div>
        
        {aiResult && (
          <div className="result-panel">
            <h3>AI Result</h3>
            <pre>{JSON.stringify(aiResult, null, 2)}</pre>
          </div>
        )}
      </section>

      {/* Asset Management Panel */}
      <section className="asset-panel">
        <h2>Asset Management</h2>
        <button 
          onClick={handleAssetSync}
          disabled={loading}
        >
          Sync Demo Asset
        </button>
        
        {syncResult && (
          <div className="result-panel">
            <h3>Sync Result</h3>
            <p>Total Assets: {syncResult.totalAssets}</p>
            <p>Synced: {syncResult.syncedAssets}</p>
            <p>Failed: {syncResult.failedAssets}</p>
          </div>
        )}
      </section>

      {/* Payment Panel */}
      <section className="payment-panel">
        <h2>Payment Processing</h2>
        <button 
          onClick={handleCreatePayment}
          disabled={loading}
        >
          Create Demo Payment
        </button>
        
        {paymentResult && (
          <div className="result-panel">
            <h3>Payment Created</h3>
            <p>Payment ID: {paymentResult.paymentId}</p>
            <p>Status: {paymentResult.status}</p>
            {paymentResult.approvalUrl && (
              <a 
                href={paymentResult.approvalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Complete Payment
              </a>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

// Asset Upload Component
const AssetUploadComponent = () => {
  const { syncAssets, loading, error } = useLegendoSync();
  const [files, setFiles] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const assets = await Promise.all(
      files.map(async (file, index) => {
        const fileData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });

        return {
          id: `upload-${Date.now()}-${index}`,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          data: fileData,
          metadata: {
            filename: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          }
        };
      })
    );

    try {
      const result = await syncAssets(assets);
      setUploadResult(result);
      setFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="asset-upload">
      <h3>Upload Assets</h3>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        disabled={loading}
      />
      <button 
        onClick={handleUpload}
        disabled={loading || files.length === 0}
      >
        {loading ? 'Uploading...' : 'Upload Files'}
      </button>
      
      {error && <div className="error">Error: {error}</div>}
      
      {uploadResult && (
        <div className="upload-result">
          <h4>Upload Complete</h4>
          <p>Uploaded: {uploadResult.syncedAssets}/{uploadResult.totalAssets} files</p>
        </div>
      )}
    </div>
  );
};

// Payment Success Component
const PaymentSuccess = () => {
  const { executePayment } = useLegendoSync();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    const payerId = urlParams.get('PayerID');

    if (paymentId && payerId) {
      executePayment(paymentId, payerId)
        .then(setResult)
        .catch(console.error);
    }
  }, [executePayment]);

  return (
    <div className="payment-success">
      <h2>Payment Processing</h2>
      {result ? (
        <div>
          <h3>Payment Successful!</h3>
          <p>Payment ID: {result.paymentId}</p>
          <p>Status: {result.status}</p>
        </div>
      ) : (
        <div>Processing payment...</div>
      )}
    </div>
  );
};

export default LegendoSyncDashboard;
export { AssetUploadComponent, PaymentSuccess, useLegendoSync };
```

### CSS Styles for React Components

```css
.legendo-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.dashboard-header h1 {
  color: #333;
  margin: 0;
}

.loading-indicator {
  background: #007bff;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
}

.error-message {
  background: #dc3545;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
}

.status-panel, .ai-panel, .asset-panel, .payment-panel {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.status-panel h2, .ai-panel h2, .asset-panel h2, .payment-panel h2 {
  margin-top: 0;
  color: #495057;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.status-card {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.status-card h3 {
  margin-top: 0;
  color: #6c757d;
  font-size: 16px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.healthy {
  background: #d4edda;
  color: #155724;
}

.status-badge.unhealthy {
  background: #f8d7da;
  color: #721c24;
}

.security-level {
  font-weight: bold;
  color: #28a745;
  font-size: 18px;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.button-group button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.button-group button:hover:not(:disabled) {
  background: #0056b3;
}

.button-group button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.result-panel {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 15px;
  margin-top: 15px;
}

.result-panel h3 {
  margin-top: 0;
  color: #495057;
}

.result-panel pre {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}

.asset-upload {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  border: 1px solid #dee2e6;
}

.asset-upload input[type="file"] {
  margin: 10px 0;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  width: 100%;
}

.upload-result {
  margin-top: 15px;
  padding: 10px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  color: #155724;
}

.payment-success {
  text-align: center;
  padding: 40px;
  background: #d4edda;
  border-radius: 8px;
  margin: 20px 0;
}

.payment-success h2 {
  color: #155724;
}

.payment-success h3 {
  color: #28a745;
}

@media (max-width: 768px) {
  .legendo-dashboard {
    padding: 10px;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .button-group button {
    width: 100%;
  }
}
```

## cURL Examples

### Complete cURL Command Reference

```bash
#!/bin/bash

# LEGENDO SYNC cURL Examples
# Make sure the server is running on localhost:3000

BASE_URL="http://localhost:3000"

echo "=== LEGENDO SYNC cURL Examples ==="

# 1. Health Check
echo -e "\n1. Health Check:"
curl -s -X GET "$BASE_URL/health" | jq '.'

# 2. Basic AI Activation
echo -e "\n2. AI Activation:"
curl -s -X POST "$BASE_URL/trigger" \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}' | jq '.'

# 3. AI Command with Custom Session
echo -e "\n3. AI Command with Session:"
SESSION_ID=$(uuidgen)
curl -s -X POST "$BASE_URL/trigger" \
  -H "Content-Type: application/json" \
  -d "{\"input\": \"VAULT_STATUS\", \"options\": {\"sessionId\": \"$SESSION_ID\"}}" | jq '.'

# 4. Asset Synchronization
echo -e "\n4. Asset Synchronization:"
curl -s -X POST "$BASE_URL/sync" \
  -H "Content-Type: application/json" \
  -d '{
    "assets": [
      {
        "id": "curl-doc-001",
        "type": "document",
        "data": {
          "title": "cURL Test Document",
          "content": "This document was created via cURL",
          "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"
        },
        "metadata": {
          "source": "curl",
          "test": true
        }
      },
      {
        "id": "curl-config-001",
        "type": "configuration",
        "data": {
          "setting1": "value1",
          "setting2": "value2",
          "enabled": true
        },
        "metadata": {
          "version": "1.0",
          "environment": "test"
        }
      }
    ]
  }' | jq '.'

# 5. PayPal Payment Creation
echo -e "\n5. PayPal Payment Creation:"
curl -s -X POST "$BASE_URL/paypal/create" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "name": "cURL Test Service",
        "sku": "CURL-TEST-001",
        "price": "15.99",
        "currency": "USD",
        "quantity": 1
      },
      {
        "name": "Additional Feature",
        "sku": "CURL-FEAT-001",
        "price": "5.00",
        "currency": "USD",
        "quantity": 2
      }
    ],
    "total": "25.99",
    "currency": "USD",
    "description": "cURL integration test payment",
    "returnUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }' | jq '.'

# 6. Session Retrieval
echo -e "\n6. Session Retrieval:"
curl -s -X GET "$BASE_URL/session/$SESSION_ID" | jq '.'

# 7. Vault Status
echo -e "\n7. Vault Status:"
curl -s -X GET "$BASE_URL/vault/status" | jq '.'

# 8. Error Handling Example (Invalid Input)
echo -e "\n8. Error Handling (Invalid Input):"
curl -s -X POST "$BASE_URL/trigger" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}' | jq '.'

# 9. Rate Limiting Test
echo -e "\n9. Rate Limiting Test (Multiple Requests):"
for i in {1..5}; do
  echo "Request $i:"
  curl -s -X GET "$BASE_URL/health" -w "Status: %{http_code}, Time: %{time_total}s\n" -o /dev/null
  sleep 1
done

# 10. Large Asset Test
echo -e "\n10. Large Asset Test:"
LARGE_DATA=$(printf 'A%.0s' {1..1000})  # 1000 character string
curl -s -X POST "$BASE_URL/sync" \
  -H "Content-Type: application/json" \
  -d "{
    \"assets\": [
      {
        \"id\": \"large-asset-$(date +%s)\",
        \"type\": \"document\",
        \"data\": {
          \"content\": \"$LARGE_DATA\",
          \"size\": ${#LARGE_DATA}
        },
        \"metadata\": {
          \"test\": \"large_data\",
          \"created\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")\"
        }
      }
    ]
  }" | jq '.'

echo -e "\n=== Examples Complete ==="
```

### Advanced cURL Scripts

```bash
#!/bin/bash

# Advanced LEGENDO SYNC cURL Testing Script

BASE_URL="http://localhost:3000"
LOG_FILE="legendo_test_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Test function with error handling
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    log "${YELLOW}Testing: $name${NC}"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                   -H "Content-Type: application/json" \
                   -d "$data")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq "$expected_status" ]; then
        log "${GREEN}✓ PASS${NC} - HTTP $http_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        log "${RED}✗ FAIL${NC} - Expected HTTP $expected_status, got HTTP $http_code"
        echo "$body"
    fi
    
    echo ""
}

# Performance test function
performance_test() {
    local name="$1"
    local endpoint="$2"
    local requests="$3"
    
    log "${YELLOW}Performance Test: $name ($requests requests)${NC}"
    
    start_time=$(date +%s.%N)
    
    for i in $(seq 1 "$requests"); do
        curl -s -o /dev/null "$BASE_URL$endpoint"
    done
    
    end_time=$(date +%s.%N)
    duration=$(echo "$end_time - $start_time" | bc)
    rps=$(echo "scale=2; $requests / $duration" | bc)
    
    log "${GREEN}Duration: ${duration}s, RPS: ${rps}${NC}"
    echo ""
}

# Main test suite
main() {
    log "=== LEGENDO SYNC Advanced Testing Suite ==="
    log "Started at: $(date)"
    log "Base URL: $BASE_URL"
    log "Log file: $LOG_FILE"
    echo ""
    
    # Basic functionality tests
    test_endpoint "Health Check" "GET" "/health" "" 200
    
    test_endpoint "AI Activation" "POST" "/trigger" \
        '{"input": "HALO BA LEGENDO"}' 200
    
    test_endpoint "Vault Status" "POST" "/trigger" \
        '{"input": "VAULT_STATUS"}' 200
    
    test_endpoint "Asset Sync" "POST" "/sync" \
        '{
            "assets": [
                {
                    "id": "test-'$(date +%s)'",
                    "type": "document",
                    "data": {"content": "test"},
                    "metadata": {"test": true}
                }
            ]
        }' 200
    
    # Error handling tests
    test_endpoint "Invalid AI Input" "POST" "/trigger" \
        '{"invalid": "data"}' 400
    
    test_endpoint "Missing Asset Data" "POST" "/sync" \
        '{"assets": [{"id": "test"}]}' 500
    
    test_endpoint "Invalid PayPal Data" "POST" "/paypal/create" \
        '{"invalid": "payment"}' 500
    
    test_endpoint "Non-existent Session" "GET" "/session/non-existent" "" 404
    
    test_endpoint "Non-existent Endpoint" "GET" "/invalid-endpoint" "" 404
    
    # Performance tests
    performance_test "Health Check Performance" "/health" 10
    performance_test "Vault Status Performance" "/vault/status" 5
    
    # Rate limiting test
    log "${YELLOW}Rate Limiting Test${NC}"
    for i in {1..15}; do
        http_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
        if [ "$http_code" -eq 429 ]; then
            log "${GREEN}✓ Rate limiting triggered at request $i${NC}"
            break
        fi
        sleep 0.1
    done
    echo ""
    
    # Concurrent requests test
    log "${YELLOW}Concurrent Requests Test${NC}"
    for i in {1..5}; do
        curl -s "$BASE_URL/health" > /dev/null &
    done
    wait
    log "${GREEN}✓ Concurrent requests completed${NC}"
    echo ""
    
    log "=== Testing Complete ==="
    log "Results logged to: $LOG_FILE"
}

# Check dependencies
command -v jq >/dev/null 2>&1 || { echo "jq is required but not installed. Aborting." >&2; exit 1; }
command -v bc >/dev/null 2>&1 || { echo "bc is required but not installed. Aborting." >&2; exit 1; }

# Run tests
main
```

## Advanced Integration Examples

### Microservices Integration

```javascript
// microservice-integration.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const LegendoSyncClient = require('./legendo-sync-client');

class MicroserviceGateway {
  constructor() {
    this.app = express();
    this.legendoClient = new LegendoSyncClient();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    
    // LEGENDO SYNC integration middleware
    this.app.use('/api/legendo', async (req, res, next) => {
      req.legendo = this.legendoClient;
      next();
    });

    // Proxy to other microservices
    this.app.use('/api/users', createProxyMiddleware({
      target: 'http://user-service:3001',
      changeOrigin: true
    }));

    this.app.use('/api/orders', createProxyMiddleware({
      target: 'http://order-service:3002',
      changeOrigin: true
    }));
  }

  setupRoutes() {
    // Enhanced order processing with LEGENDO SYNC
    this.app.post('/api/orders/enhanced', async (req, res) => {
      try {
        const { orderData, paymentData } = req.body;
        
        // 1. Process order through order service
        const orderResponse = await fetch('http://order-service:3002/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
        
        const order = await orderResponse.json();
        
        // 2. Sync order data as asset
        await req.legendo.syncAssets([{
          id: `order-${order.id}`,
          type: 'order',
          data: order,
          metadata: {
            service: 'order-service',
            timestamp: new Date().toISOString()
          }
        }]);
        
        // 3. Process payment through LEGENDO SYNC
        const payment = await req.legendo.createPayment(paymentData);
        
        // 4. Execute AI analysis
        const aiAnalysis = await req.legendo.executeAI('ANALYZE_ORDER', {
          orderData: order,
          paymentData: payment
        });
        
        res.json({
          order,
          payment,
          analysis: aiAnalysis,
          status: 'enhanced_processing_complete'
        });
        
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Bulk data processing endpoint
    this.app.post('/api/bulk/process', async (req, res) => {
      try {
        const { data, processingType } = req.body;
        
        // Convert data to assets
        const assets = data.map((item, index) => ({
          id: `bulk-${Date.now()}-${index}`,
          type: processingType,
          data: item,
          metadata: {
            batchId: req.headers['x-batch-id'],
            index,
            timestamp: new Date().toISOString()
          }
        }));
        
        // Sync assets
        const syncResult = await req.legendo.syncAssets(assets);
        
        // Process with AI
        const aiResult = await req.legendo.executeAI(`BULK_PROCESS_${processingType.toUpperCase()}`, {
          assets: syncResult.results,
          batchId: req.headers['x-batch-id']
        });
        
        res.json({
          syncResult,
          aiResult,
          processedCount: data.length
        });
        
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(`Microservice Gateway running on port ${port}`);
    });
  }
}

// Usage
const gateway = new MicroserviceGateway();
gateway.start(3000);
```

### Event-Driven Architecture Integration

```javascript
// event-driven-integration.js
const EventEmitter = require('events');
const LegendoSyncClient = require('./legendo-sync-client');

class LegendoEventProcessor extends EventEmitter {
  constructor() {
    super();
    this.legendo = new LegendoSyncClient();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // User registration event
    this.on('user.registered', async (userData) => {
      try {
        // Sync user data as asset
        await this.legendo.syncAssets([{
          id: `user-${userData.id}`,
          type: 'user_profile',
          data: userData,
          metadata: {
            event: 'user.registered',
            timestamp: new Date().toISOString()
          }
        }]);

        // AI analysis of user registration
        const analysis = await this.legendo.executeAI('ANALYZE_USER_REGISTRATION', {
          userData,
          sessionId: `user-reg-${userData.id}`
        });

        this.emit('user.analysis.complete', { userData, analysis });
      } catch (error) {
        this.emit('error', { event: 'user.registered', error });
      }
    });

    // Order placed event
    this.on('order.placed', async (orderData) => {
      try {
        // Sync order as asset
        await this.legendo.syncAssets([{
          id: `order-${orderData.id}`,
          type: 'order',
          data: orderData,
          metadata: {
            event: 'order.placed',
            timestamp: new Date().toISOString()
          }
        }]);

        // Create payment if needed
        if (orderData.paymentRequired) {
          const payment = await this.legendo.createPayment({
            items: orderData.items,
            total: orderData.total,
            currency: orderData.currency,
            description: `Order ${orderData.id}`,
            returnUrl: `${process.env.BASE_URL}/orders/${orderData.id}/success`,
            cancelUrl: `${process.env.BASE_URL}/orders/${orderData.id}/cancel`
          });

          this.emit('payment.created', { orderData, payment });
        }

        // AI fraud detection
        const fraudCheck = await this.legendo.executeAI('FRAUD_DETECTION', {
          orderData,
          sessionId: `fraud-check-${orderData.id}`
        });

        if (fraudCheck.result.riskLevel === 'high') {
          this.emit('order.flagged', { orderData, fraudCheck });
        } else {
          this.emit('order.approved', { orderData, fraudCheck });
        }

      } catch (error) {
        this.emit('error', { event: 'order.placed', error });
      }
    });

    // Payment completed event
    this.on('payment.completed', async (paymentData) => {
      try {
        // Execute AI post-payment analysis
        const analysis = await this.legendo.executeAI('POST_PAYMENT_ANALYSIS', {
          paymentData,
          sessionId: `payment-analysis-${paymentData.paymentId}`
        });

        // Sync payment data
        await this.legendo.syncAssets([{
          id: `payment-${paymentData.paymentId}`,
          type: 'payment',
          data: paymentData,
          metadata: {
            event: 'payment.completed',
            analysis: analysis.result,
            timestamp: new Date().toISOString()
          }
        }]);

        this.emit('payment.processed', { paymentData, analysis });

      } catch (error) {
        this.emit('error', { event: 'payment.completed', error });
      }
    });

    // System health check event
    this.on('system.health.check', async () => {
      try {
        const vaultStatus = await this.legendo.getVaultStatus();
        const health = await this.legendo.getHealth();

        const systemStatus = {
          vault: vaultStatus,
          health: health,
          timestamp: new Date().toISOString()
        };

        this.emit('system.status.updated', systemStatus);

        // Alert if unhealthy
        if (health.status !== 'healthy' || vaultStatus.status !== 'secure') {
          this.emit('system.alert', {
            level: 'warning',
            message: 'System health degraded',
            details: systemStatus
          });
        }

      } catch (error) {
        this.emit('system.alert', {
          level: 'critical',
          message: 'Health check failed',
          error: error.message
        });
      }
    });
  }

  // Periodic health checks
  startHealthMonitoring(interval = 60000) {
    setInterval(() => {
      this.emit('system.health.check');
    }, interval);
  }
}

// Usage example
const eventProcessor = new LegendoEventProcessor();

// Set up event listeners
eventProcessor.on('user.analysis.complete', (data) => {
  console.log('User analysis complete:', data.analysis.result);
});

eventProcessor.on('order.flagged', (data) => {
  console.log('Order flagged for review:', data.orderData.id);
  // Send to manual review queue
});

eventProcessor.on('system.alert', (alert) => {
  console.error('System Alert:', alert);
  // Send to monitoring system
});

// Start health monitoring
eventProcessor.startHealthMonitoring(30000); // Every 30 seconds

// Simulate events
eventProcessor.emit('user.registered', {
  id: 'user-123',
  email: 'user@example.com',
  name: 'John Doe',
  registrationDate: new Date().toISOString()
});

eventProcessor.emit('order.placed', {
  id: 'order-456',
  userId: 'user-123',
  items: [
    { name: 'Product A', price: '29.99', quantity: 1 }
  ],
  total: '29.99',
  currency: 'USD',
  paymentRequired: true
});
```

This comprehensive examples documentation provides practical, real-world usage scenarios for integrating LEGENDO SYNC into various applications and architectures. Each example includes complete, working code that can be adapted for specific use cases.