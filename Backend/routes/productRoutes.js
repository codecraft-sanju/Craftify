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
const { protect, seller } = require('../middleware/authMiddleware');

// Base Routes
router.route('/')
    .get(getProducts) // Marketplace Search
    .post(protect, seller, createProduct); // Add Product

// Specific Lists (Static/Distinct Paths)
router.get('/top', getTopProducts);
router.get('/shop/:shopId', getProductsByShop);

// Reviews
router.route('/:id/reviews').post(protect, createProductReview);

// Dynamic ID Routes (Last)
router.route('/:id')
    .get(getProductById)
    .put(protect, seller, updateProduct)
    .delete(protect, deleteProduct); // Seller or Founder (handled in controller)

module.exports = router;