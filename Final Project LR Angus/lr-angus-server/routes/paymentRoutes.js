const express = require('express');
const PaymentController = require('../controllers/PaymentController');

const router = express.Router();

// נתיב ברירת מחדל לבדיקה
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API תשלומים פועל תקין 💳',
    version: '1.0.0',
    endpoints: [
      {
        method: 'POST',
        path: '/api/payments/process',
        description: 'עיבוד תשלום'
      },
      {
        method: 'GET',
        path: '/api/payments/methods',
        description: 'קבלת אמצעי תשלום זמינים'
      },
      {
        method: 'GET',
        path: '/api/payments/status/:paymentId',
        description: 'בדיקת סטטוס תשלום'
      }
    ]
  });
});

// נתיבי תשלומים
router.post('/process', PaymentController.processPayment); // POST /api/payments/process
router.get('/methods', PaymentController.getPaymentMethods); // GET /api/payments/methods

// נתיב לבדיקת סטטוס תשלום
router.get('/status/:paymentId', PaymentController.getPaymentStatus); // GET /api/payments/status/:id

module.exports = router;