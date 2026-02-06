// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
    registerUser,
    authUser,
    logoutUser, 
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
    // --- Global Settings Functions ---
    getGlobalQR,    
    updateGlobalQR,
    getCategoryImages,   // <--- Added This
    updateCategoryImage, // <--- Added This
    // --- Wishlist Functions ---
    getWishlist,
    addToWishlist,
    removeFromWishlist
} = require('../controllers/userController');
const { protect, founder } = require('../middleware/authMiddleware');

// Public Routes
router.post('/login', authUser);
router.post('/logout', logoutUser); 

// --- GLOBAL SETTINGS ROUTES (QR & Categories) ---

// 1. QR Code
router.get('/qr', getGlobalQR); // Public
router.post('/qr', protect, founder, updateGlobalQR); // Founder Only

// 2. Category Images (Yeh Naya Hai)
router.get('/categories', getCategoryImages); // Public: Customers needs to see images
router.put('/categories', protect, founder, updateCategoryImage); // Founder Only: To update images

// Protected (Profile)
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// --- WISHLIST ROUTES ---
router.route('/wishlist')
    .get(protect, getWishlist)      // Get my wishlist
    .post(protect, addToWishlist);  // Add item to wishlist

router.route('/wishlist/:id')
    .delete(protect, removeFromWishlist); // Remove item

// Founder/Admin Routes + Register
router.route('/')
    .post(registerUser) // Register is public
    .get(protect, founder, getUsers); // List users (Founder only)

// IMPORTANT: Keep this route at the bottom to avoid conflicts
// Agar '/categories' iske neeche hota, toh code samajhta ki "categories" ek ID hai.
router.route('/:id')
    .get(protect, founder, getUserById)
    .put(protect, founder, updateUser)
    .delete(protect, founder, deleteUser);

module.exports = router;