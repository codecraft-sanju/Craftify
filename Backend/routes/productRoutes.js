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
    getProductsByShop,
    deleteProductsBatch // <--- IMPORT ADDED
} = require('../controllers/productController');
const { protect, seller } = require('../middleware/authMiddleware');

// Base Routes
router.route('/')
    .get(getProducts) // Marketplace Search
    .post(protect, seller, createProduct); // Add Product

// --- NEW BATCH DELETE ROUTE ---
// Isko hamesha '/:id' wale route se PEHLE rakhna zaroori hai
// Humne sirf 'protect' lagaya hai, kyunki controller andar check karega ki user Founder hai ya Seller
router.route('/batch').delete(protect, deleteProductsBatch); 

// Specific Lists (Static/Distinct Paths)
router.get('/top', getTopProducts);
router.get('/shop/:shopId', getProductsByShop);

// Reviews
router.route('/:id/reviews').post(protect, createProductReview);

// Dynamic ID Routes (Last)
// Note: '/:id' sabse last mein hona chahiye taaki upar wale routes block na hon
router.route('/:id')
    .get(getProductById)
    .put(protect, seller, updateProduct)
    .delete(protect, deleteProduct); // Seller or Founder (handled in controller)

module.exports = router;