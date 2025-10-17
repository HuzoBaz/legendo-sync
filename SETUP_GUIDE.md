# LEGENDO SYNC - Setup and Installation Guide

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Methods](#installation-methods)
3. [Configuration](#configuration)
4. [Environment Setup](#environment-setup)
5. [Database Setup](#database-setup)
6. [PayPal Integration](#paypal-integration)
7. [Testing Installation](#testing-installation)
8. [Troubleshooting](#troubleshooting)
9. [Production Deployment](#production-deployment)

## System Requirements

### Minimum Requirements

- **Operating System:** Linux (Ubuntu 18.04+), macOS (10.15+), or Windows 10+
- **Node.js:** Version 14.0.0 or higher
- **npm:** Version 6.0.0 or higher
- **Memory:** 2GB RAM minimum, 4GB recommended
- **Storage:** 1GB free space
- **Network:** Internet connection for PayPal API access

### Recommended Requirements

- **Operating System:** Linux (Ubuntu 20.04+)
- **Node.js:** Version 18.0.0 or higher
- **Memory:** 8GB RAM
- **Storage:** 10GB free space
- **CPU:** 2+ cores

## Installation Methods

### Method 1: Direct Clone (Recommended)

```bash
# Clone the repository
git clone https://github.com/HuzoBaz/legendo-sync.git
cd legendo-sync

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Method 2: npm Package (Future)

```bash
# Install globally
npm install -g legendo-sync

# Or install locally in your project
npm install legendo-sync
```

### Method 3: Docker (Recommended for Production)

```bash
# Clone repository
git clone https://github.com/HuzoBaz/legendo-sync.git
cd legendo-sync

# Build Docker image
docker build -t legendo-sync .

# Run container
docker run -p 3000:3000 --env-file .env legendo-sync
```

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
HOST=localhost

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_EMAIL=your_paypal_email@example.com
PAYPAL_MODE=sandbox

# Database Configuration (if using external database)
DATABASE_URL=postgresql://username:password@localhost:5432/legendo_sync
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_jwt_secret_key
API_KEY_SECRET=your_api_key_secret
WEBHOOK_SECRET=your_webhook_secret

# Logging
LOG_LEVEL=info
LOG_FILE=logs/legendo-sync.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=1000

# AI Processing
AI_MODEL_PATH=./models/legendo-ai
AI_CONFIDENCE_THRESHOLD=0.8
```

### Configuration File

Create a `config.json` file for advanced configuration:

```json
{
  "server": {
    "port": 3000,
    "host": "localhost",
    "cors": {
      "origin": ["http://localhost:3000", "https://yourdomain.com"],
      "credentials": true
    }
  },
  "paypal": {
    "mode": "sandbox",
    "clientId": "your_paypal_client_id",
    "clientSecret": "your_paypal_client_secret",
    "webhookId": "your_webhook_id"
  },
  "database": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "database": "legendo_sync",
    "username": "legendo_user",
    "password": "secure_password"
  },
  "ai": {
    "modelPath": "./models/legendo-ai",
    "confidenceThreshold": 0.8,
    "maxProcessingTime": 300000,
    "batchSize": 10
  },
  "security": {
    "jwtExpiry": "24h",
    "apiKeyExpiry": "30d",
    "maxLoginAttempts": 5,
    "lockoutDuration": "15m"
  }
}
```

## Environment Setup

### Development Environment

1. **Install Node.js and npm:**
   ```bash
   # Using Node Version Manager (nvm)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   
   # Or download from nodejs.org
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Set up development tools:**
   ```bash
   # Install development dependencies
   npm install --save-dev nodemon jest supertest
   
   # Install linting tools
   npm install --save-dev eslint prettier
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

### Production Environment

1. **Install PM2 for process management:**
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 ecosystem file:**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'legendo-sync',
       script: 'index.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       },
       env_production: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

3. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

## Database Setup

### Option 1: SQLite (Default - Development)

No additional setup required. SQLite database will be created automatically.

### Option 2: PostgreSQL (Recommended for Production)

1. **Install PostgreSQL:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql
   
   # Windows
   # Download from postgresql.org
   ```

2. **Create database and user:**
   ```sql
   sudo -u postgres psql
   CREATE DATABASE legendo_sync;
   CREATE USER legendo_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE legendo_sync TO legendo_user;
   \q
   ```

3. **Run migrations:**
   ```bash
   npm run migrate
   ```

### Option 3: MySQL

1. **Install MySQL:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mysql-server
   
   # macOS
   brew install mysql
   ```

2. **Create database:**
   ```sql
   mysql -u root -p
   CREATE DATABASE legendo_sync;
   CREATE USER 'legendo_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON legendo_sync.* TO 'legendo_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

## PayPal Integration

### 1. Create PayPal Developer Account

1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Sign in with your PayPal account
3. Create a new application
4. Choose "REST API" as the integration type

### 2. Get API Credentials

1. In your PayPal Developer Dashboard:
   - Go to "My Apps & Credentials"
   - Select your application
   - Copy the Client ID and Client Secret

2. Update your `.env` file:
   ```env
   PAYPAL_CLIENT_ID=your_client_id_here
   PAYPAL_CLIENT_SECRET=your_client_secret_here
   PAYPAL_EMAIL=your_paypal_email@example.com
   ```

### 3. Configure Webhooks (Optional)

1. In PayPal Developer Dashboard:
   - Go to "Webhooks"
   - Create a new webhook
   - Set the webhook URL: `https://yourdomain.com/webhooks/paypal`
   - Select events: Payment completed, Payment failed

2. Update your configuration:
   ```env
   PAYPAL_WEBHOOK_ID=your_webhook_id_here
   ```

### 4. Test PayPal Integration

```bash
# Test payment creation
curl -X POST http://localhost:3000/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": {
      "total": "1.00",
      "currency": "USD"
    },
    "description": "Test payment"
  }'
```

## Testing Installation

### 1. Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T10:00:00Z",
  "version": "1.0.0",
  "uptime": 3600
}
```

### 2. Test API Endpoints

```bash
# Test trigger endpoint
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{"input": "HALO BA LEGENDO"}'

# Test status endpoint
curl http://localhost:3000/status/test-job-id
```

### 3. Run Test Suite

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --grep "API endpoints"

# Run with coverage
npm run test:coverage
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm start
```

#### 2. PayPal Authentication Failed

**Error:** `PayPal authentication failed`

**Solutions:**
- Verify your PayPal credentials in `.env`
- Check if you're using sandbox credentials for testing
- Ensure your PayPal account is verified

#### 3. Database Connection Error

**Error:** `Database connection failed`

**Solutions:**
- Check database service is running
- Verify connection string in `.env`
- Ensure database user has proper permissions

#### 4. Module Not Found

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

Enable debug logging:

```bash
DEBUG=legendo-sync:* npm start
```

### Log Files

Check log files for detailed error information:

```bash
# View application logs
tail -f logs/legendo-sync.log

# View error logs
tail -f logs/error.log
```

## Production Deployment

### 1. Server Setup

**Ubuntu 20.04+ Server:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx (for reverse proxy)
sudo apt install nginx

# Install SSL certificate (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
```

### 2. Application Deployment

```bash
# Clone repository
git clone https://github.com/HuzoBaz/legendo-sync.git
cd legendo-sync

# Install dependencies
npm install --production

# Set up environment
cp .env.example .env
# Edit .env with production values

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 3. Nginx Configuration

Create `/etc/nginx/sites-available/legendo-sync`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/legendo-sync /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com
```

### 5. Firewall Configuration

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 6. Monitoring

Set up monitoring with PM2:

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# View logs
pm2 logs legendo-sync

# Monitor resources
pm2 monit
```

### 7. Backup Strategy

```bash
# Database backup script
#!/bin/bash
pg_dump legendo_sync > backup_$(date +%Y%m%d_%H%M%S).sql

# Application backup
tar -czf legendo-sync-backup_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/legendo-sync
```

## Security Considerations

### 1. Environment Variables

- Never commit `.env` files to version control
- Use strong, unique secrets
- Rotate secrets regularly

### 2. Database Security

- Use strong passwords
- Enable SSL connections
- Regular security updates

### 3. API Security

- Implement rate limiting
- Use HTTPS in production
- Validate all inputs
- Implement proper authentication

### 4. Server Security

- Keep system updated
- Use firewall rules
- Regular security audits
- Monitor logs for suspicious activity

## Performance Optimization

### 1. Node.js Optimization

```bash
# Increase memory limit
node --max-old-space-size=4096 index.js

# Enable clustering
pm2 start ecosystem.config.js --instances max
```

### 2. Database Optimization

- Create appropriate indexes
- Regular VACUUM and ANALYZE
- Connection pooling
- Query optimization

### 3. Caching

- Implement Redis for caching
- Use CDN for static assets
- Cache API responses

## Maintenance

### Regular Tasks

1. **Daily:**
   - Check application logs
   - Monitor system resources
   - Verify backups

2. **Weekly:**
   - Update dependencies
   - Review security logs
   - Performance analysis

3. **Monthly:**
   - Security audit
   - Database maintenance
   - Update documentation

### Update Process

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run migrations (if any)
npm run migrate

# Restart application
pm2 restart legendo-sync
```

## Support

For additional help:

- **Documentation:** https://docs.legendo-sync.com
- **GitHub Issues:** https://github.com/HuzoBaz/legendo-sync/issues
- **Email Support:** support@legendo-sync.com
- **Community Discord:** https://discord.gg/legendo-sync