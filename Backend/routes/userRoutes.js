// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const {
    registerUser,
    verifyUserOtp, 
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
    getOfferBanners,    
    updateOfferBanners,  
    getWishlist,
    addToWishlist,
    removeFromWishlist
} = require('../controllers/userController');
const { protect, founder } = require('../middleware/authMiddleware');

// --- AUTH ROUTES ---
router.post('/verify-otp', verifyUserOtp);
router.post('/login', authUser);
router.post('/logout', logoutUser); 

// --- GLOBAL SETTINGS ROUTES (QR, Categories & Banners) ---

// 1. QR Code
router.get('/qr', getGlobalQR); // Public
router.post('/qr', protect, founder, updateGlobalQR); // Founder Only

// 2. Category Images 
router.get('/categories', getCategoryImages); // Public
router.put('/categories', protect, founder, updateCategoryImage); // Founder Only

// 3. Offer Banners
router.get('/banners', getOfferBanners); // Public
router.put('/banners', protect, founder, updateOfferBanners); // Founder Only

// --- USER PROFILE ---
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// --- WISHLIST ROUTES ---
router.route('/wishlist')
    .get(protect, getWishlist)      // Get my wishlist
    .post(protect, addToWishlist);  // Add item to wishlist

router.route('/wishlist/:id')
    .delete(protect, removeFromWishlist); // Remove item

// --- ADMIN / FOUNDER ROUTES + REGISTER ---
router.route('/')
    .post(registerUser) // Register is public (Sends OTP via WhatsApp or Email)
    .get(protect, founder, getUsers); // List users (Founder only)

// IMPORTANT: Keep this route at the bottom to avoid conflicts
router.route('/:id')
    .get(protect, founder, getUserById)
    .put(protect, founder, updateUser)
    .delete(protect, founder, deleteUser);

module.exports = router;