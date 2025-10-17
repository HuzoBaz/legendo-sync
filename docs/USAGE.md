# LEGENDO SYNC Usage Guide

## Quick Start

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/HuzoBaz/legendo-sync.git
cd legendo-sync
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
# Create .env file
cp .env.example .env

# Edit .env with your configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_EMAIL=your_paypal_email
ENCRYPTION_KEY=your_32_byte_encryption_key
```

4. **Start the server:**
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## Basic Usage Examples

### 1. Health Check

Check if the service is running:

```bash
curl http://localhost:3000/health
```

### 2. AI Command Execution

Execute the basic LEGENDO activation command:

```bash
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}'
```

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2023-10-17T10:30:00.000Z",
  "status": "success",
  "result": {
    "message": "LEGENDO SYNC activated successfully",
    "status": "active",
    "capabilities": ["asset_sync", "paypal_injection", "vault_security"]
  },
  "metadata": {
    "processingTime": 45,
    "inputLength": 15
  }
}
```

### 3. Asset Synchronization

Sync assets with vault-grade security:

```bash
curl -X POST http://localhost:3000/sync \
  -H "Content-Type: application/json" \
  -d '{
    "assets": [
      {
        "id": "document-001",
        "type": "document",
        "data": {
          "title": "Important Contract",
          "content": "Contract details...",
          "version": "1.0"
        },
        "metadata": {
          "priority": "high",
          "department": "legal"
        }
      },
      {
        "id": "image-001",
        "type": "image",
        "data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
        "metadata": {
          "format": "png",
          "dimensions": "1x1"
        }
      }
    ]
  }'
```

### 4. PayPal Payment Processing

Create a PayPal payment:

```bash
curl -X POST http://localhost:3000/paypal/create \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "name": "LEGENDO Premium Service",
        "sku": "LEG-PREM-001",
        "price": "29.99",
        "currency": "USD",
        "quantity": 1
      }
    ],
    "total": "29.99",
    "currency": "USD",
    "description": "Premium service subscription",
    "returnUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }'
```

## Advanced Usage

### Custom AI Commands

You can send custom commands to the AI executor:

```javascript
// Using fetch in JavaScript
const response = await fetch('http://localhost:3000/trigger', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: 'Analyze user behavior patterns',
    options: {
      sessionId: 'analytics-session-001',
      customData: {
        timeframe: '30days',
        metrics: ['engagement', 'conversion']
      }
    }
  })
});

const result = await response.json();
console.log('AI Analysis Result:', result);
```

### Session Management

Track and retrieve session data:

```javascript
// Execute command with custom session ID
const executeResponse = await fetch('http://localhost:3000/trigger', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input: 'VAULT_STATUS',
    options: { sessionId: 'my-session-123' }
  })
});

const execution = await executeResponse.json();
console.log('Session ID:', execution.sessionId);

// Later, retrieve session data
const sessionResponse = await fetch(`http://localhost:3000/session/${execution.sessionId}`);
const sessionData = await sessionResponse.json();
console.log('Session Data:', sessionData);
```

### Batch Asset Processing

Process multiple assets efficiently:

```javascript
const assets = [
  { id: 'doc1', type: 'document', data: { title: 'Doc 1' } },
  { id: 'doc2', type: 'document', data: { title: 'Doc 2' } },
  { id: 'img1', type: 'image', data: 'base64-image-data' }
];

const syncResponse = await fetch('http://localhost:3000/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ assets })
});

const syncResult = await syncResponse.json();
console.log(`Synced ${syncResult.syncedAssets}/${syncResult.totalAssets} assets`);
```

## Integration Examples

### Node.js Integration

```javascript
const axios = require('axios');

class LegendoSyncClient {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.axios = axios.create({ baseURL });
  }

  async executeAI(input, options = {}) {
    try {
      const response = await this.axios.post('/trigger', { input, options });
      return response.data;
    } catch (error) {
      throw new Error(`AI execution failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async syncAssets(assets) {
    try {
      const response = await this.axios.post('/sync', { assets });
      return response.data;
    } catch (error) {
      throw new Error(`Asset sync failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async createPayment(paymentData) {
    try {
      const response = await this.axios.post('/paypal/create', paymentData);
      return response.data;
    } catch (error) {
      throw new Error(`Payment creation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async getVaultStatus() {
    try {
      const response = await this.axios.get('/vault/status');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get vault status: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Usage
const client = new LegendoSyncClient();

async function example() {
  // Execute AI command
  const aiResult = await client.executeAI('HALO BA LEGENDO');
  console.log('AI Result:', aiResult);

  // Sync assets
  const assets = [{ id: 'test', type: 'document', data: { content: 'test' } }];
  const syncResult = await client.syncAssets(assets);
  console.log('Sync Result:', syncResult);

  // Check vault status
  const status = await client.getVaultStatus();
  console.log('Vault Status:', status);
}

example().catch(console.error);
```

### Python Integration

```python
import requests
import json

class LegendoSyncClient:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})

    def execute_ai(self, input_text, options=None):
        """Execute AI command"""
        if options is None:
            options = {}
        
        payload = {"input": input_text, "options": options}
        response = self.session.post(f"{self.base_url}/trigger", json=payload)
        response.raise_for_status()
        return response.json()

    def sync_assets(self, assets):
        """Synchronize assets"""
        payload = {"assets": assets}
        response = self.session.post(f"{self.base_url}/sync", json=payload)
        response.raise_for_status()
        return response.json()

    def create_payment(self, payment_data):
        """Create PayPal payment"""
        response = self.session.post(f"{self.base_url}/paypal/create", json=payment_data)
        response.raise_for_status()
        return response.json()

    def get_vault_status(self):
        """Get vault status"""
        response = self.session.get(f"{self.base_url}/vault/status")
        response.raise_for_status()
        return response.json()

# Usage example
client = LegendoSyncClient()

# Execute AI command
ai_result = client.execute_ai("HALO BA LEGENDO")
print("AI Result:", ai_result)

# Sync assets
assets = [
    {
        "id": "python-doc",
        "type": "document",
        "data": {"title": "Python Integration", "content": "Example content"}
    }
]
sync_result = client.sync_assets(assets)
print("Sync Result:", sync_result)
```

### React Frontend Integration

```jsx
import React, { useState, useEffect } from 'react';

const LegendoSyncDashboard = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const API_BASE = 'http://localhost:3000';

  useEffect(() => {
    fetchVaultStatus();
  }, []);

  const fetchVaultStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/vault/status`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch vault status:', error);
    }
  };

  const executeAICommand = async (command) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: command })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('AI execution failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>LEGENDO SYNC Dashboard</h1>
      
      {/* Vault Status */}
      <div className="status-panel">
        <h2>Vault Status</h2>
        {status && (
          <div>
            <p>Status: <span className="status-badge">{status.status}</span></p>
            <p>Active Sessions: {status.activeSessions}</p>
            <p>Cached Assets: {status.cachedAssets}</p>
            <p>Security Level: {status.securityLevel}</p>
          </div>
        )}
      </div>

      {/* AI Commands */}
      <div className="command-panel">
        <h2>AI Commands</h2>
        <div className="button-group">
          <button onClick={() => executeAICommand('HALO BA LEGENDO')}>
            Activate LEGENDO
          </button>
          <button onClick={() => executeAICommand('VAULT_STATUS')}>
            Check Vault
          </button>
          <button onClick={() => executeAICommand('HEALTH_CHECK')}>
            Health Check
          </button>
        </div>
      </div>

      {/* Results */}
      {loading && <div className="loading">Processing...</div>}
      {result && (
        <div className="result-panel">
          <h2>Execution Result</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default LegendoSyncDashboard;
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# PayPal Configuration (Required for payment features)
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_EMAIL=your_paypal_email@example.com

# Security Configuration
ENCRYPTION_KEY=your_32_byte_encryption_key_here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging Configuration
LOG_LEVEL=info
```

### PayPal Setup

1. **Create PayPal Developer Account:**
   - Go to https://developer.paypal.com/
   - Create an account or sign in
   - Create a new application

2. **Get Credentials:**
   - Copy Client ID and Client Secret
   - Use sandbox mode for testing
   - Switch to live mode for production

3. **Configure Webhooks (Optional):**
   - Set up webhooks for payment notifications
   - Configure return and cancel URLs

### Security Configuration

1. **Generate Encryption Key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. **Configure CORS:**
   - Add your frontend domains to `ALLOWED_ORIGINS`
   - Use specific domains instead of wildcards in production

3. **SSL/TLS:**
   - Always use HTTPS in production
   - Configure proper SSL certificates

## Monitoring and Logging

### Log Files

- `error.log` - Error messages only
- `combined.log` - All log messages
- Console output - Real-time monitoring

### Health Monitoring

```bash
# Check service health
curl http://localhost:3000/health

# Monitor vault status
curl http://localhost:3000/vault/status

# Check specific session
curl http://localhost:3000/session/SESSION_ID
```

### Performance Monitoring

The service provides built-in performance metrics:

```javascript
// Get performance data
const status = await fetch('http://localhost:3000/vault/status');
const data = await status.json();

console.log('Memory Usage:', data.memoryUsage);
console.log('Uptime:', data.uptime);
console.log('Active Sessions:', data.activeSessions);
```

## Troubleshooting

### Common Issues

1. **Port Already in Use:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 PID
```

2. **PayPal Configuration Errors:**
   - Verify credentials in PayPal Developer Dashboard
   - Check sandbox vs live mode settings
   - Ensure webhook URLs are accessible

3. **Rate Limiting:**
   - Default: 10 requests per minute per IP
   - Adjust rate limits in code if needed
   - Implement retry logic in clients

4. **Memory Issues:**
   - Monitor memory usage via `/vault/status`
   - Cleanup runs every 30 minutes
   - Adjust cleanup intervals if needed

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug npm start
```

### Testing

Run basic connectivity tests:

```bash
# Test health endpoint
curl -f http://localhost:3000/health || echo "Health check failed"

# Test AI trigger
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HEALTH_CHECK"}' || echo "AI trigger failed"
```

## Best Practices

### Security

1. **Use Environment Variables** for all sensitive configuration
2. **Enable HTTPS** in production environments
3. **Implement API Authentication** for production use
4. **Monitor Rate Limits** and adjust as needed
5. **Rotate Encryption Keys** regularly
6. **Validate All Inputs** on both client and server side

### Performance

1. **Monitor Memory Usage** regularly
2. **Implement Client-Side Caching** for frequently accessed data
3. **Use Connection Pooling** for database connections
4. **Optimize Asset Sizes** before synchronization
5. **Implement Retry Logic** with exponential backoff

### Development

1. **Use Version Control** for all configuration changes
2. **Test in Sandbox Mode** before production deployment
3. **Monitor Logs** for errors and performance issues
4. **Document Custom Integrations**
5. **Keep Dependencies Updated**

## Support

For issues and questions:

1. Check the logs for error messages
2. Verify configuration settings
3. Test with minimal examples
4. Review the API documentation
5. Check PayPal Developer documentation for payment issues