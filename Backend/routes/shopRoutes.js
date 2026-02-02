// backend/routes/shopRoutes.js
const express = require('express');
const router = express.Router();
const {
    registerShop,
    getMyShop, 
    getShopById,
    updateShopProfile,
    getAllShops,
    deleteShop,
    updateShopStatus
} = require('../controllers/shopController');
const { protect, seller, founder } = require('../middleware/authMiddleware');

// 1. Static Routes (Specific Paths) - MUST BE TOP
router.route('/')
    .post(protect, registerShop) // Create Shop
    .get(protect, founder, getAllShops); // Founder View

router.route('/my-shop')
    .get(protect, getMyShop) // --- FIX: Updated variable name here too ---
    .put(protect, seller, updateShopProfile);

// 2. Dynamic Routes (Parameters) - MUST BE BOTTOM
router.get('/:id', getShopById); // Public Shop View

// Founder Actions on Specific ID
router.delete('/:id', protect, founder, deleteShop);
router.put('/:id/status', protect, founder, updateShopStatus);

module.exports = router;