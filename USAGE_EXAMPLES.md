# LEGENDO SYNC - Usage Examples and Code Samples

## Table of Contents

1. [Quick Start Examples](#quick-start-examples)
2. [JavaScript/Node.js Examples](#javascriptnodejs-examples)
3. [Python Examples](#python-examples)
4. [cURL Examples](#curl-examples)
5. [React/Next.js Integration](#reactnextjs-integration)
6. [Vue.js Integration](#vuejs-integration)
7. [Angular Integration](#angular-integration)
8. [Mobile App Integration](#mobile-app-integration)
9. [Webhook Handling](#webhook-handling)
10. [Error Handling Patterns](#error-handling-patterns)
11. [Advanced Use Cases](#advanced-use-cases)

## Quick Start Examples

### Basic Asset Sync

```javascript
// Simple asset synchronization
const response = await fetch('http://localhost:3000/trigger', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    input: 'HALO BA LEGENDO'
  })
});

const result = await response.json();
console.log('Sync initiated:', result.jobId);
```

### Basic Payment Processing

```javascript
// Create a PayPal payment
const paymentResponse = await fetch('http://localhost:3000/payments/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: {
      total: '10.00',
      currency: 'USD'
    },
    description: 'Asset sync processing fee'
  })
});

const payment = await paymentResponse.json();
console.log('Payment created:', payment.paymentId);
```

## JavaScript/Node.js Examples

### Complete Sync Workflow

```javascript
class LegendoSyncClient {
  constructor(baseUrl = 'http://localhost:3000', apiKey = null) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async triggerSync(input, options = {}) {
    const response = await fetch(`${this.baseUrl}/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({
        input,
        options: {
          syncMode: 'full',
          priority: 'normal',
          ...options
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getStatus(jobId) {
    const response = await fetch(`${this.baseUrl}/status/${jobId}`, {
      headers: {
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async waitForCompletion(jobId, pollInterval = 5000) {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getStatus(jobId);
          
          if (status.status === 'completed') {
            resolve(status);
          } else if (status.status === 'failed') {
            reject(new Error(`Sync failed: ${status.error?.message || 'Unknown error'}`));
          } else {
            console.log(`Progress: ${status.progress || 0}%`);
            setTimeout(poll, pollInterval);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      poll();
    });
  }
}

// Usage
const client = new LegendoSyncClient('http://localhost:3000', 'your-api-key');

async function syncAssets() {
  try {
    // Start sync
    const job = await client.triggerSync('HALO BA LEGENDO', {
      syncMode: 'incremental',
      priority: 'high'
    });
    
    console.log('Sync started:', job.jobId);
    
    // Wait for completion
    const result = await client.waitForCompletion(job.jobId);
    console.log('Sync completed:', result.result);
    
  } catch (error) {
    console.error('Sync failed:', error.message);
  }
}

syncAssets();
```

### Payment Processing with Retry Logic

```javascript
class PaymentProcessor {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async createPayment(amount, description, returnUrl, cancelUrl) {
    const response = await fetch(`${this.baseUrl}/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: {
          total: amount.toFixed(2),
          currency: 'USD'
        },
        description,
        returnUrl,
        cancelUrl
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Payment creation failed: ${error.error?.message || 'Unknown error'}`);
    }

    return await response.json();
  }

  async executePayment(paymentId, payerId, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/payments/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            paymentId,
            payerId
          })
        });

        if (response.ok) {
          return await response.json();
        }

        const error = await response.json();
        lastError = new Error(`Payment execution failed: ${error.error?.message || 'Unknown error'}`);
        
        if (attempt < maxRetries) {
          console.log(`Attempt ${attempt} failed, retrying in ${attempt * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          console.log(`Attempt ${attempt} failed, retrying in ${attempt * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }
    
    throw lastError;
  }
}

// Usage
const paymentProcessor = new PaymentProcessor();

async function processPayment() {
  try {
    // Create payment
    const payment = await paymentProcessor.createPayment(
      25.00,
      'Premium asset sync service',
      'https://yourapp.com/payment/success',
      'https://yourapp.com/payment/cancel'
    );
    
    console.log('Payment created:', payment.paymentId);
    console.log('Redirect user to:', payment.approvalUrl);
    
    // Simulate user approval (in real app, user would be redirected)
    const payerId = 'PayerID123';
    
    // Execute payment
    const result = await paymentProcessor.executePayment(payment.paymentId, payerId);
    console.log('Payment executed:', result.transactionId);
    
  } catch (error) {
    console.error('Payment processing failed:', error.message);
  }
}

processPayment();
```

### Batch Processing

```javascript
class BatchProcessor {
  constructor(client) {
    this.client = client;
  }

  async processBatch(inputs, options = {}) {
    const jobs = [];
    const results = [];
    
    // Start all sync jobs
    for (const input of inputs) {
      try {
        const job = await this.client.triggerSync(input, options);
        jobs.push(job);
        console.log(`Started job ${job.jobId} for input: ${input}`);
      } catch (error) {
        console.error(`Failed to start job for input ${input}:`, error.message);
        results.push({ input, error: error.message });
      }
    }
    
    // Wait for all jobs to complete
    const promises = jobs.map(async (job) => {
      try {
        const result = await this.client.waitForCompletion(job.jobId);
        return { input: job.input, result };
      } catch (error) {
        return { input: job.input, error: error.message };
      }
    });
    
    const jobResults = await Promise.all(promises);
    results.push(...jobResults);
    
    return results;
  }
}

// Usage
const client = new LegendoSyncClient('http://localhost:3000', 'your-api-key');
const batchProcessor = new BatchProcessor(client);

async function processMultipleAssets() {
  const inputs = [
    'HALO BA LEGENDO',
    'Asset sync batch 1',
    'Asset sync batch 2',
    'Asset sync batch 3'
  ];
  
  const results = await batchProcessor.processBatch(inputs, {
    syncMode: 'incremental',
    priority: 'normal'
  });
  
  console.log('Batch processing completed:');
  results.forEach(result => {
    if (result.error) {
      console.error(`❌ ${result.input}: ${result.error}`);
    } else {
      console.log(`✅ ${result.input}: ${result.result.assetsProcessed} assets processed`);
    }
  });
}

processMultipleAssets();
```

## Python Examples

### Python Client Library

```python
import requests
import time
import json
from typing import Dict, Any, Optional

class LegendoSyncClient:
    def __init__(self, base_url: str = "http://localhost:3000", api_key: Optional[str] = None):
        self.base_url = base_url
        self.api_key = api_key
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({
                'Authorization': f'Bearer {api_key}'
            })
    
    def trigger_sync(self, input_data: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Trigger asset synchronization"""
        url = f"{self.base_url}/trigger"
        payload = {
            'input': input_data,
            'options': options or {}
        }
        
        response = self.session.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    
    def get_status(self, job_id: str) -> Dict[str, Any]:
        """Get sync job status"""
        url = f"{self.base_url}/status/{job_id}"
        response = self.session.get(url)
        response.raise_for_status()
        return response.json()
    
    def wait_for_completion(self, job_id: str, poll_interval: int = 5) -> Dict[str, Any]:
        """Wait for sync job completion"""
        while True:
            status = self.get_status(job_id)
            
            if status['status'] == 'completed':
                return status
            elif status['status'] == 'failed':
                raise Exception(f"Sync failed: {status.get('error', {}).get('message', 'Unknown error')}")
            
            print(f"Progress: {status.get('progress', 0)}%")
            time.sleep(poll_interval)
    
    def create_payment(self, amount: float, description: str, return_url: str, cancel_url: str) -> Dict[str, Any]:
        """Create PayPal payment"""
        url = f"{self.base_url}/payments/create"
        payload = {
            'amount': {
                'total': f"{amount:.2f}",
                'currency': 'USD'
            },
            'description': description,
            'returnUrl': return_url,
            'cancelUrl': cancel_url
        }
        
        response = self.session.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    
    def execute_payment(self, payment_id: str, payer_id: str) -> Dict[str, Any]:
        """Execute PayPal payment"""
        url = f"{self.base_url}/payments/execute"
        payload = {
            'paymentId': payment_id,
            'payerId': payer_id
        }
        
        response = self.session.post(url, json=payload)
        response.raise_for_status()
        return response.json()

# Usage
def main():
    client = LegendoSyncClient("http://localhost:3000", "your-api-key")
    
    try:
        # Trigger sync
        job = client.trigger_sync("HALO BA LEGENDO", {
            'syncMode': 'full',
            'priority': 'high'
        })
        print(f"Sync started: {job['jobId']}")
        
        # Wait for completion
        result = client.wait_for_completion(job['jobId'])
        print(f"Sync completed: {result['result']}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
```

### Async Python Client

```python
import asyncio
import aiohttp
import json
from typing import Dict, Any, Optional

class AsyncLegendoSyncClient:
    def __init__(self, base_url: str = "http://localhost:3000", api_key: Optional[str] = None):
        self.base_url = base_url
        self.api_key = api_key
        self.headers = {'Content-Type': 'application/json'}
        if api_key:
            self.headers['Authorization'] = f'Bearer {api_key}'
    
    async def trigger_sync(self, input_data: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Trigger asset synchronization asynchronously"""
        url = f"{self.base_url}/trigger"
        payload = {
            'input': input_data,
            'options': options or {}
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=self.headers) as response:
                response.raise_for_status()
                return await response.json()
    
    async def get_status(self, job_id: str) -> Dict[str, Any]:
        """Get sync job status asynchronously"""
        url = f"{self.base_url}/status/{job_id}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=self.headers) as response:
                response.raise_for_status()
                return await response.json()
    
    async def wait_for_completion(self, job_id: str, poll_interval: int = 5) -> Dict[str, Any]:
        """Wait for sync job completion asynchronously"""
        while True:
            status = await self.get_status(job_id)
            
            if status['status'] == 'completed':
                return status
            elif status['status'] == 'failed':
                raise Exception(f"Sync failed: {status.get('error', {}).get('message', 'Unknown error')}")
            
            print(f"Progress: {status.get('progress', 0)}%")
            await asyncio.sleep(poll_interval)

# Usage
async def main():
    client = AsyncLegendoSyncClient("http://localhost:3000", "your-api-key")
    
    try:
        # Trigger multiple syncs concurrently
        tasks = [
            client.trigger_sync("HALO BA LEGENDO 1"),
            client.trigger_sync("HALO BA LEGENDO 2"),
            client.trigger_sync("HALO BA LEGENDO 3")
        ]
        
        jobs = await asyncio.gather(*tasks)
        print(f"Started {len(jobs)} sync jobs")
        
        # Wait for all to complete
        completion_tasks = [client.wait_for_completion(job['jobId']) for job in jobs]
        results = await asyncio.gather(*completion_tasks)
        
        for i, result in enumerate(results):
            print(f"Job {i+1} completed: {result['result']}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
```

## cURL Examples

### Basic API Calls

```bash
# Health check
curl http://localhost:3000/health

# Trigger sync
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}'

# Get sync status
curl http://localhost:3000/status/job-id-here

# Create payment
curl -X POST http://localhost:3000/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": {
      "total": "10.00",
      "currency": "USD"
    },
    "description": "Asset sync processing fee"
  }'

# Execute payment
curl -X POST http://localhost:3000/payments/execute \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "PAY-XXXXXXXXXXXX",
    "payerId": "PayerID"
  }'
```

### Advanced cURL Examples

```bash
# Sync with custom options
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "input": "HALO BA LEGENDO",
    "options": {
      "syncMode": "incremental",
      "priority": "high",
      "callbackUrl": "https://yourapp.com/webhook/sync-complete"
    }
  }'

# Payment with custom return URLs
curl -X POST http://localhost:3000/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": {
      "total": "25.00",
      "currency": "USD"
    },
    "description": "Premium asset sync service",
    "returnUrl": "https://yourapp.com/payment/success?order=123",
    "cancelUrl": "https://yourapp.com/payment/cancel?order=123"
  }'

# Batch status check
for job_id in job1 job2 job3; do
  echo "Checking job: $job_id"
  curl -s http://localhost:3000/status/$job_id | jq '.status'
done
```

## React/Next.js Integration

### React Hook for Asset Sync

```jsx
import { useState, useCallback } from 'react';

export const useAssetSync = (baseUrl = 'http://localhost:3000', apiKey = null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);

  const triggerSync = useCallback(async (input, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
        },
        body: JSON.stringify({ input, options })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setJobs(prev => [...prev, result]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, apiKey]);

  const getStatus = useCallback(async (jobId) => {
    try {
      const response = await fetch(`${baseUrl}/status/${jobId}`, {
        headers: {
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [baseUrl, apiKey]);

  return {
    triggerSync,
    getStatus,
    isLoading,
    error,
    jobs
  };
};

// Usage in component
const AssetSyncComponent = () => {
  const { triggerSync, getStatus, isLoading, error, jobs } = useAssetSync();
  const [input, setInput] = useState('HALO BA LEGENDO');

  const handleSync = async () => {
    try {
      const job = await triggerSync(input, {
        syncMode: 'full',
        priority: 'normal'
      });
      console.log('Sync started:', job.jobId);
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter sync input"
      />
      <button onClick={handleSync} disabled={isLoading}>
        {isLoading ? 'Syncing...' : 'Start Sync'}
      </button>
      {error && <div className="error">Error: {error}</div>}
      <div>
        <h3>Active Jobs:</h3>
        {jobs.map(job => (
          <div key={job.jobId}>
            Job {job.jobId}: {job.status}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Next.js API Route

```javascript
// pages/api/sync.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { input, options } = req.body;

    // Forward request to LEGENDO SYNC API
    const response = await fetch('http://localhost:3000/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LEGENDO_API_KEY}`
      },
      body: JSON.stringify({ input, options })
    });

    if (!response.ok) {
      throw new Error(`LEGENDO SYNC API error: ${response.status}`);
    }

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error('Sync API error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Usage in component
const syncAssets = async (input) => {
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input,
      options: { syncMode: 'full' }
    })
  });

  return await response.json();
};
```

## Vue.js Integration

### Vue Composable

```javascript
// composables/useAssetSync.js
import { ref, reactive } from 'vue';

export function useAssetSync(baseUrl = 'http://localhost:3000', apiKey = null) {
  const isLoading = ref(false);
  const error = ref(null);
  const jobs = reactive([]);

  const triggerSync = async (input, options = {}) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${baseUrl}/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
        },
        body: JSON.stringify({ input, options })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      jobs.push(result);
      return result;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getStatus = async (jobId) => {
    try {
      const response = await fetch(`${baseUrl}/status/${jobId}`, {
        headers: {
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  return {
    triggerSync,
    getStatus,
    isLoading,
    error,
    jobs
  };
}
```

### Vue Component

```vue
<template>
  <div class="asset-sync">
    <h2>Asset Synchronization</h2>
    
    <div class="input-section">
      <input
        v-model="input"
        type="text"
        placeholder="Enter sync input"
        class="sync-input"
      />
      <button
        @click="handleSync"
        :disabled="isLoading"
        class="sync-button"
      >
        {{ isLoading ? 'Syncing...' : 'Start Sync' }}
      </button>
    </div>

    <div v-if="error" class="error">
      Error: {{ error }}
    </div>

    <div class="jobs-section">
      <h3>Active Jobs</h3>
      <div v-for="job in jobs" :key="job.jobId" class="job-item">
        <span>Job {{ job.jobId }}: {{ job.status }}</span>
        <button @click="checkStatus(job.jobId)">Check Status</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useAssetSync } from '@/composables/useAssetSync';

export default {
  name: 'AssetSync',
  setup() {
    const input = ref('HALO BA LEGENDO');
    const { triggerSync, getStatus, isLoading, error, jobs } = useAssetSync();

    const handleSync = async () => {
      try {
        const job = await triggerSync(input.value, {
          syncMode: 'full',
          priority: 'normal'
        });
        console.log('Sync started:', job.jobId);
      } catch (err) {
        console.error('Sync failed:', err);
      }
    };

    const checkStatus = async (jobId) => {
      try {
        const status = await getStatus(jobId);
        console.log('Job status:', status);
      } catch (err) {
        console.error('Status check failed:', err);
      }
    };

    return {
      input,
      handleSync,
      checkStatus,
      isLoading,
      error,
      jobs
    };
  }
};
</script>

<style scoped>
.asset-sync {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.input-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.sync-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.sync-button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.sync-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-bottom: 20px;
}

.jobs-section {
  margin-top: 20px;
}

.job-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 10px;
}
</style>
```

## Angular Integration

### Angular Service

```typescript
// services/asset-sync.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface SyncJob {
  jobId: string;
  status: string;
  progress?: number;
  result?: any;
  error?: any;
}

export interface SyncOptions {
  syncMode?: 'full' | 'incremental';
  priority?: 'low' | 'normal' | 'high';
  callbackUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssetSyncService {
  private baseUrl = 'http://localhost:3000';
  private apiKey: string | null = null;
  private jobsSubject = new BehaviorSubject<SyncJob[]>([]);
  public jobs$ = this.jobsSubject.asObservable();

  constructor(private http: HttpClient) {}

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    if (this.apiKey) {
      headers = headers.set('Authorization', `Bearer ${this.apiKey}`);
    }
    return headers;
  }

  triggerSync(input: string, options: SyncOptions = {}): Observable<SyncJob> {
    const body = { input, options };
    
    return this.http.post<SyncJob>(`${this.baseUrl}/trigger`, body, {
      headers: this.getHeaders()
    }).pipe(
      map(job => {
        const currentJobs = this.jobsSubject.value;
        this.jobsSubject.next([...currentJobs, job]);
        return job;
      }),
      catchError(error => {
        console.error('Sync trigger failed:', error);
        throw error;
      })
    );
  }

  getStatus(jobId: string): Observable<SyncJob> {
    return this.http.get<SyncJob>(`${this.baseUrl}/status/${jobId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Status check failed:', error);
        throw error;
      })
    );
  }

  waitForCompletion(jobId: string, pollInterval: number = 5000): Observable<SyncJob> {
    return new Observable(observer => {
      const poll = () => {
        this.getStatus(jobId).subscribe({
          next: (status) => {
            if (status.status === 'completed') {
              observer.next(status);
              observer.complete();
            } else if (status.status === 'failed') {
              observer.error(new Error(`Sync failed: ${status.error?.message || 'Unknown error'}`));
            } else {
              observer.next(status);
              setTimeout(poll, pollInterval);
            }
          },
          error: (error) => {
            observer.error(error);
          }
        });
      };
      poll();
    });
  }
}
```

### Angular Component

```typescript
// components/asset-sync.component.ts
import { Component, OnInit } from '@angular/core';
import { AssetSyncService, SyncJob } from '../services/asset-sync.service';

@Component({
  selector: 'app-asset-sync',
  template: `
    <div class="asset-sync">
      <h2>Asset Synchronization</h2>
      
      <div class="input-section">
        <input
          [(ngModel)]="input"
          type="text"
          placeholder="Enter sync input"
          class="sync-input"
        />
        <button
          (click)="handleSync()"
          [disabled]="isLoading"
          class="sync-button"
        >
          {{ isLoading ? 'Syncing...' : 'Start Sync' }}
        </button>
      </div>

      <div *ngIf="error" class="error">
        Error: {{ error }}
      </div>

      <div class="jobs-section">
        <h3>Active Jobs</h3>
        <div *ngFor="let job of jobs" class="job-item">
          <span>Job {{ job.jobId }}: {{ job.status }}</span>
          <button (click)="checkStatus(job.jobId)">Check Status</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./asset-sync.component.css']
})
export class AssetSyncComponent implements OnInit {
  input = 'HALO BA LEGENDO';
  isLoading = false;
  error: string | null = null;
  jobs: SyncJob[] = [];

  constructor(private assetSyncService: AssetSyncService) {}

  ngOnInit() {
    this.assetSyncService.jobs$.subscribe(jobs => {
      this.jobs = jobs;
    });
  }

  handleSync() {
    this.isLoading = true;
    this.error = null;

    this.assetSyncService.triggerSync(this.input, {
      syncMode: 'full',
      priority: 'normal'
    }).subscribe({
      next: (job) => {
        console.log('Sync started:', job.jobId);
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  checkStatus(jobId: string) {
    this.assetSyncService.getStatus(jobId).subscribe({
      next: (status) => {
        console.log('Job status:', status);
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }
}
```

## Mobile App Integration

### React Native

```javascript
// services/LegendoSyncService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class LegendoSyncService {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.apiKey = null;
  }

  async setApiKey(apiKey) {
    this.apiKey = apiKey;
    await AsyncStorage.setItem('legendo_api_key', apiKey);
  }

  async getApiKey() {
    if (!this.apiKey) {
      this.apiKey = await AsyncStorage.getItem('legendo_api_key');
    }
    return this.apiKey;
  }

  async triggerSync(input, options = {}) {
    const apiKey = await this.getApiKey();
    const response = await fetch(`${this.baseUrl}/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      },
      body: JSON.stringify({ input, options })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getStatus(jobId) {
    const apiKey = await this.getApiKey();
    const response = await fetch(`${this.baseUrl}/status/${jobId}`, {
      headers: {
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export default new LegendoSyncService();
```

### Flutter/Dart

```dart
// services/legendo_sync_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class LegendoSyncService {
  final String baseUrl;
  String? _apiKey;

  LegendoSyncService({this.baseUrl = 'http://localhost:3000'});

  Future<void> setApiKey(String apiKey) async {
    _apiKey = apiKey;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('legendo_api_key', apiKey);
  }

  Future<String?> getApiKey() async {
    if (_apiKey == null) {
      final prefs = await SharedPreferences.getInstance();
      _apiKey = prefs.getString('legendo_api_key');
    }
    return _apiKey;
  }

  Map<String, String> _getHeaders() {
    final headers = {'Content-Type': 'application/json'};
    if (_apiKey != null) {
      headers['Authorization'] = 'Bearer $_apiKey';
    }
    return headers;
  }

  Future<Map<String, dynamic>> triggerSync(String input, {Map<String, dynamic>? options}) async {
    final response = await http.post(
      Uri.parse('$baseUrl/trigger'),
      headers: _getHeaders(),
      body: json.encode({
        'input': input,
        'options': options ?? {}
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('HTTP error! status: ${response.statusCode}');
    }

    return json.decode(response.body);
  }

  Future<Map<String, dynamic>> getStatus(String jobId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/status/$jobId'),
      headers: _getHeaders(),
    );

    if (response.statusCode != 200) {
      throw Exception('HTTP error! status: ${response.statusCode}');
    }

    return json.decode(response.body);
  }
}
```

## Webhook Handling

### Express.js Webhook Handler

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// Verify webhook signature
const verifyWebhookSignature = (payload, signature, secret) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

// Webhook endpoint
app.post('/webhooks/legendo-sync', (req, res) => {
  const signature = req.headers['x-legendo-signature'];
  const payload = JSON.stringify(req.body);
  const secret = process.env.WEBHOOK_SECRET;

  // Verify signature
  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { event, data } = req.body;

  switch (event) {
    case 'sync.started':
      console.log('Sync started:', data.jobId);
      // Handle sync started
      break;
    
    case 'sync.progress':
      console.log('Sync progress:', data.jobId, data.progress + '%');
      // Handle sync progress
      break;
    
    case 'sync.completed':
      console.log('Sync completed:', data.jobId, data.result);
      // Handle sync completion
      break;
    
    case 'sync.failed':
      console.log('Sync failed:', data.jobId, data.error);
      // Handle sync failure
      break;
    
    case 'payment.completed':
      console.log('Payment completed:', data.transactionId);
      // Handle payment completion
      break;
    
    default:
      console.log('Unknown event:', event);
  }

  res.status(200).json({ received: true });
});

app.listen(3001, () => {
  console.log('Webhook server running on port 3001');
});
```

### Next.js API Route Webhook

```javascript
// pages/api/webhooks/legendo-sync.js
import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['x-legendo-signature'];
  const payload = JSON.stringify(req.body);
  const secret = process.env.WEBHOOK_SECRET;

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { event, data } = req.body;

  // Handle different webhook events
  switch (event) {
    case 'sync.completed':
      // Update database, send notification, etc.
      console.log('Sync completed:', data.jobId);
      break;
    
    case 'payment.completed':
      // Update payment status, send receipt, etc.
      console.log('Payment completed:', data.transactionId);
      break;
    
    default:
      console.log('Unknown event:', event);
  }

  res.status(200).json({ received: true });
}
```

## Error Handling Patterns

### Retry with Exponential Backoff

```javascript
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Usage
const syncWithRetry = async (input) => {
  return retryWithBackoff(async () => {
    const response = await fetch('http://localhost:3000/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  });
};
```

### Circuit Breaker Pattern

```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

// Usage
const circuitBreaker = new CircuitBreaker(3, 30000);

const syncWithCircuitBreaker = async (input) => {
  return circuitBreaker.execute(async () => {
    const response = await fetch('http://localhost:3000/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  });
};
```

## Advanced Use Cases

### Real-time Progress Updates

```javascript
class RealtimeSyncMonitor {
  constructor(client, onProgress, onComplete, onError) {
    this.client = client;
    this.onProgress = onProgress;
    this.onComplete = onComplete;
    this.onError = onError;
    this.activeJobs = new Map();
  }

  async startSync(input, options = {}) {
    try {
      const job = await this.client.triggerSync(input, options);
      this.activeJobs.set(job.jobId, job);
      this.monitorJob(job.jobId);
      return job;
    } catch (error) {
      this.onError(error);
      throw error;
    }
  }

  async monitorJob(jobId) {
    const poll = async () => {
      try {
        const status = await this.client.getStatus(jobId);
        
        if (status.status === 'completed') {
          this.activeJobs.delete(jobId);
          this.onComplete(status);
        } else if (status.status === 'failed') {
          this.activeJobs.delete(jobId);
          this.onError(new Error(status.error?.message || 'Sync failed'));
        } else {
          this.onProgress(jobId, status);
          setTimeout(poll, 2000); // Poll every 2 seconds
        }
      } catch (error) {
        this.activeJobs.delete(jobId);
        this.onError(error);
      }
    };
    
    poll();
  }

  getActiveJobs() {
    return Array.from(this.activeJobs.values());
  }
}

// Usage
const monitor = new RealtimeSyncMonitor(
  client,
  (jobId, status) => {
    console.log(`Job ${jobId} progress: ${status.progress}%`);
    // Update UI with progress
  },
  (result) => {
    console.log('Sync completed:', result);
    // Handle completion
  },
  (error) => {
    console.error('Sync error:', error);
    // Handle error
  }
);

// Start monitoring
const job = await monitor.startSync('HALO BA LEGENDO');
console.log('Started monitoring job:', job.jobId);
```

### Batch Processing with Progress Tracking

```javascript
class BatchProcessor {
  constructor(client) {
    this.client = client;
    this.batches = new Map();
  }

  async processBatch(batchId, inputs, options = {}) {
    const batch = {
      id: batchId,
      inputs,
      jobs: [],
      results: [],
      status: 'processing',
      startTime: Date.now(),
      completedCount: 0,
      totalCount: inputs.length
    };

    this.batches.set(batchId, batch);

    // Start all jobs
    for (const input of inputs) {
      try {
        const job = await this.client.triggerSync(input, options);
        batch.jobs.push(job);
        this.monitorJob(batchId, job);
      } catch (error) {
        batch.results.push({ input, error: error.message });
        batch.completedCount++;
      }
    }

    return batch;
  }

  async monitorJob(batchId, job) {
    const poll = async () => {
      try {
        const status = await this.client.getStatus(job.jobId);
        const batch = this.batches.get(batchId);
        
        if (!batch) return;

        if (status.status === 'completed') {
          batch.results.push({ input: job.input, result: status.result });
          batch.completedCount++;
        } else if (status.status === 'failed') {
          batch.results.push({ input: job.input, error: status.error?.message });
          batch.completedCount++;
        } else {
          setTimeout(poll, 2000);
          return;
        }

        // Check if batch is complete
        if (batch.completedCount >= batch.totalCount) {
          batch.status = 'completed';
          batch.endTime = Date.now();
          batch.duration = batch.endTime - batch.startTime;
        }
      } catch (error) {
        const batch = this.batches.get(batchId);
        if (batch) {
          batch.results.push({ input: job.input, error: error.message });
          batch.completedCount++;
        }
      }
    };
    
    poll();
  }

  getBatchStatus(batchId) {
    return this.batches.get(batchId);
  }

  getAllBatches() {
    return Array.from(this.batches.values());
  }
}

// Usage
const batchProcessor = new BatchProcessor(client);

const batch = await batchProcessor.processBatch('batch-1', [
  'HALO BA LEGENDO 1',
  'HALO BA LEGENDO 2',
  'HALO BA LEGENDO 3'
], { syncMode: 'incremental' });

console.log('Batch started:', batch.id);

// Monitor batch progress
const checkBatch = () => {
  const status = batchProcessor.getBatchStatus('batch-1');
  console.log(`Batch progress: ${status.completedCount}/${status.totalCount}`);
  
  if (status.status === 'completed') {
    console.log('Batch completed:', status.results);
  } else {
    setTimeout(checkBatch, 5000);
  }
};

checkBatch();
```

This comprehensive documentation covers all the major usage patterns and integration examples for the LEGENDO SYNC API. The examples are production-ready and include proper error handling, retry logic, and best practices for each platform and use case.