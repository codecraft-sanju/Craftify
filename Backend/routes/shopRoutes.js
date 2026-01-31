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

// Public
router.get('/:id', getShopById);

// Protected (Seller Actions)
router.route('/')
    .post(protect, registerShop) // Create Shop (User becomes Seller)
    .get(protect, founder, getAllShops); // Founder sees all shops

router.route('/my-shop')
    .get(protect, getMyShop)
    .put(protect, seller, updateShopProfile);

// Founder Actions
router.delete('/:id', protect, founder, deleteShop);
router.put('/:id/status', protect, founder, updateShopStatus);

module.exports = router;