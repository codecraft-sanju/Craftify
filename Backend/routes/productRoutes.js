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
    getRelatedProducts,
    getProductsByShop,
    deleteProductsBatch 
} = require('../controllers/productController');

// --- CHANGES MADE HERE: Removed 'seller' import since we handle roles in the controller now ---
const { protect } = require('../middleware/authMiddleware');

// Base Routes
router.route('/')
    .get(getProducts) // Marketplace Search
    // --- CHANGES MADE HERE: Removed 'seller' middleware ---
    .post(protect, createProduct); // Add Product (Handled in controller for Seller/Founder)

// --- NEW BATCH DELETE ROUTE ---
router.route('/batch').delete(protect, deleteProductsBatch); 

// Specific Lists (Static/Distinct Paths)
router.get('/top', getTopProducts);
router.get('/shop/:shopId', getProductsByShop);

// Reviews
router.route('/:id/reviews').post(protect, createProductReview);

router.route('/:id/related').get(getRelatedProducts);

// Dynamic ID Routes (Last)
router.route('/:id')
    .get(getProductById)
    // --- CHANGES MADE HERE: Removed 'seller' middleware ---
    .put(protect, updateProduct) 
    .delete(protect, deleteProduct); 

module.exports = router;