index.js
Initial LEGENDO SYNC injection
git clone https://github.com/HuzoBaz/legendo-sync.git
cd legendo-sync
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_EMAIL=8limbuzz@gmail.com
npm init -y
npm install express paypal-rest-sdk dotenv
node index.js
LEGENDO SYNC running on port 3000
curl -X POST http://localhost:3000/trigger \
-H "Content-Type: application/json" \
-d '{"input": "HALO BA LEGENDO"}'
index.js
Initial LEGENDO SYNC injection
Initial LEGENDO SYNC injection
Initial LEGENDO SYNC injection
