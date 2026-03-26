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
    deleteProductsBatch,
    incrementProductView,
    getTrendingProducts,
    getCategories,
    // --- CHANGES MADE HERE: Imported new admin review functions ---
    getAllReviewsAdmin,
    updateReviewAdmin,
    deleteReviewAdmin
} = require('../controllers/productController');


const { protect } = require('../middleware/authMiddleware');


router.route('/')
    .get(getProducts) 

    .post(protect, createProduct);


router.route('/batch').delete(protect, deleteProductsBatch); 

router.get('/top', getTopProducts);

router.get('/trending', getTrendingProducts);


router.get('/categories', getCategories);


router.get('/shop/:shopId', getProductsByShop);
router.get('/admin/all-reviews', protect, getAllReviewsAdmin);
router.put('/admin/reviews/:productId/:reviewId', protect, updateReviewAdmin);
router.delete('/admin/reviews/:productId/:reviewId', protect, deleteReviewAdmin);


router.route('/:id/reviews').post(protect, createProductReview);

router.route('/:id/related').get(getRelatedProducts);

router.put('/:id/view', incrementProductView);


router.route('/:id')
    .get(getProductById)
  
    .put(protect, updateProduct) 
    .delete(protect, deleteProduct); 

module.exports = router;