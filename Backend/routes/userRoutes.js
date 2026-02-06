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
    getGlobalQR,    
    updateGlobalQR,
    getCategoryImages,   
    updateCategoryImage, 
    // --- Offer Banner Functions (New) ---
    getOfferBanners,     // <--- Added This
    updateOfferBanners,  // <--- Added This
    // --- Wishlist Functions ---
    getWishlist,
    addToWishlist,
    removeFromWishlist
} = require('../controllers/userController');
const { protect, founder } = require('../middleware/authMiddleware');

// Public Routes
router.post('/login', authUser);
router.post('/logout', logoutUser); 

// --- GLOBAL SETTINGS ROUTES (QR, Categories & Banners) ---

// 1. QR Code
router.get('/qr', getGlobalQR); // Public
router.post('/qr', protect, founder, updateGlobalQR); // Founder Only

// 2. Category Images 
router.get('/categories', getCategoryImages); // Public
router.put('/categories', protect, founder, updateCategoryImage); // Founder Only

// 3. Offer Banners (Yeh Naya Hai)
router.get('/banners', getOfferBanners); // Public: Homepage needs to fetch banners
router.put('/banners', protect, founder, updateOfferBanners); // Founder Only: Update/Hide banners

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
// Agar '/banners' ya '/categories' iske neeche hota, toh code samajhta ki woh ek ID hai.
router.route('/:id')
    .get(protect, founder, getUserById)
    .put(protect, founder, updateUser)
    .delete(protect, founder, deleteUser);

module.exports = router;