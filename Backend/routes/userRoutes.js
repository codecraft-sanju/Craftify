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
    getGlobalQR,    
    updateGlobalQR,
    getWishlist,
    addToWishlist,
    removeFromWishlist
} = require('../controllers/userController');
const { protect, founder } = require('../middleware/authMiddleware');

// Public Routes
router.post('/login', authUser);
router.post('/logout', logoutUser); 

// --- GLOBAL QR CODE ROUTES (For Centralized Payment) ---
router.get('/qr', getGlobalQR); // Public: Customers need to see this to pay
router.post('/qr', protect, founder, updateGlobalQR); // Private: Only Founder can update this

// Protected (Profile)
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// --- NEW: WISHLIST ROUTES ---
router.route('/wishlist')
    .get(protect, getWishlist)      // Get my wishlist
    .post(protect, addToWishlist);  // Add item to wishlist

router.route('/wishlist/:id')
    .delete(protect, removeFromWishlist); // Remove item (passed Product ID in URL)

// Founder/Admin Routes + Register
router.route('/')
    .post(registerUser) // Register is public
    .get(protect, founder, getUsers); // List users (Founder only)

// IMPORTANT: Keep this route at the bottom to avoid conflicts
router.route('/:id')
    .get(protect, founder, getUserById)
    .put(protect, founder, updateUser)
    .delete(protect, founder, deleteUser);

module.exports = router;