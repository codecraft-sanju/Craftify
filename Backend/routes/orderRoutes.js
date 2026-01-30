const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderStatus,
    getMyOrders,
    getShopOrders,
    getOrders
} = require('../controllers/orderController');
const { protect, seller, founder } = require('../middleware/authMiddleware');

// Base Routes
router.route('/')
    .post(protect, addOrderItems) // Customer places order
    .get(protect, founder, getOrders); // Founder sees all

// Specific Lists
router.route('/myorders').get(protect, getMyOrders); // Customer History
router.route('/shop-orders').get(protect, seller, getShopOrders); // Seller Dashboard

// Specific Order Operations
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid); // Payment Gateway webhook
router.route('/:id/deliver').put(protect, seller, updateOrderStatus); // Update Status

module.exports = router;