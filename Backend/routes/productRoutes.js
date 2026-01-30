const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getTopProducts,
    getProductsByShop
} = require('../controllers/productController');
const { protect, seller, founder } = require('../middleware/authMiddleware');

// Public Routes
router.route('/')
    .get(getProducts) // Search + Filter logic here
    .post(protect, seller, createProduct); // Only Seller can add

router.get('/top', getTopProducts);
router.get('/shop/:shopId', getProductsByShop);

// Reviews (Customer)
router.route('/:id/reviews').post(protect, createProductReview);

// Specific Product Operations
router.route('/:id')
    .get(getProductById) // Public
    .put(protect, seller, updateProduct) // Seller only
    .delete(protect, deleteProduct); // Seller (own) or Founder

module.exports = router;