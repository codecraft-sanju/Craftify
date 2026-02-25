const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware'); // Aapka protect middleware

router.route('/').get(protect, getCart).post(protect, addToCart).delete(protect, clearCart);
router.route('/update').put(protect, updateCartQuantity);
router.route('/:itemId').delete(protect, removeFromCart);

module.exports = router;