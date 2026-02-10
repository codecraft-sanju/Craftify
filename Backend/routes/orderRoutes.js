// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    verifyOrderPayment, // Renamed from updateOrderToPaid
    settlePayout,       // NEW: For Payout Proofs
    updateOrderStatus,
    getMyOrders,
    getShopOrders,
    getOrders
} = require('../controllers/orderController');
const { protect, seller, founder } = require('../middleware/authMiddleware');

// Base Route
router.route('/')
    .post(protect, addOrderItems) // Place Order (Customer)
    .get(protect, founder, getOrders); // Admin View (Global Orders)

// Specific Lists (Static Paths)
router.route('/myorders').get(protect, getMyOrders); // Customer History
router.route('/shop-orders').get(protect, seller, getShopOrders); // Seller Dashboard (Gatekeeper Active)

// Dynamic ID Routes (Last)
router.route('/:id').get(protect, getOrderById);

// Payment Verification (FOUNDER ONLY) - The Gatekeeper Unlock
router.route('/:id/pay').put(protect, founder, verifyOrderPayment); 

// Payout Settlement (FOUNDER ONLY) - Upload Proof
router.route('/:id/payout').put(protect, founder, settlePayout);

// Delivery Status (SELLER Action)
router.route('/:id/deliver').put(protect, seller, updateOrderStatus); 

module.exports = router;