require('dotenv').config();
const express = require('express');
const paypal = require('paypal-rest-sdk');

const app = express();
app.use(express.json());

// LEGENDO SYNC - PayPal Business Configuration
// Connected to: 8limbuzz@gmail.com
paypal.configure({
    'mode': 'live', // Switch to 'sandbox' for testing
    'client_id': process.env.PAYPAL_CLIENT_ID || 'your_paypal_client_id',
    'client_secret': process.env.PAYPAL_CLIENT_SECRET || 'your_paypal_client_secret'
});

const PAYPAL_EMAIL = '8limbuzz@gmail.com';

app.post('/create-payment', (req, res) => {
    const { productName, price } = req.body;
    
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "https://foreverfit-zpjz5xxm.manus.space/success",
            "cancel_url": "https://foreverfit-zpjz5xxm.manus.space/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": productName,
                    "sku": "001",
                    "price": price,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": price
            },
            "description": `Purchase of ${productName} from ForeverFit`,
            "payee": {
                "email": PAYPAL_EMAIL
            }
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            console.error(error);
            res.status(500).send(error);
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.json({ forwardUrl: payment.links[i].href });
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`LEGENDO SYNC active on port ${PORT}`);
    console.log(`Connected to PayPal: ${PAYPAL_EMAIL}`);
});
