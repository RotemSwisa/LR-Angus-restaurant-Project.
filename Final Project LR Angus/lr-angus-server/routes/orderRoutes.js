const express = require('express');
const OrderController = require('../controllers/OrderController');

const router = express.Router();

// API נתיב ראשי למידע על 
router.get('/', OrderController.getOrdersInfo);                          // GET /api/orders

// נתיבי הזמנות משלוח
router.post('/create', OrderController.createDeliveryOrder);             // POST /api/orders/delivery
router.get('/delivery/:id', OrderController.getDeliveryOrder);           // GET /api/orders/delivery/:id
router.get('/delivery', OrderController.getAllDeliveryOrders);           // GET /api/orders/delivery
router.put('/delivery/:id/status', OrderController.updateOrderStatus);   // PUT /api/orders/delivery/:id/status

// נתיבי חישוב מחירים
router.post('/calculate-price', OrderController.calculateOrderPrice);    // POST /api/orders/calculate-price

module.exports = router;