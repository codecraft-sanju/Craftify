// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
    registerUser,
    authUser,
    logoutUser, // --- NEW
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
    getGlobalQR,    // --- NEW
    updateGlobalQR  // --- NEW
} = require('../controllers/userController');
const { protect, founder } = require('../middleware/authMiddleware');

// Public Routes
router.post('/login', authUser);
router.post('/logout', logoutUser); // --- NEW: Logout Route

// --- GLOBAL QR CODE ROUTES (For Centralized Payment) ---
router.get('/qr', getGlobalQR); // Public: Customers need to see this to pay
router.post('/qr', protect, founder, updateGlobalQR); // Private: Only Founder can update this

// Protected (Profile)
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// Founder/Admin Routes + Register
router.route('/')
    .post(registerUser) // Register is public
    .get(protect, founder, getUsers); // List users (Founder only)

router.route('/:id')
    .get(protect, founder, getUserById)
    .put(protect, founder, updateUser)
    .delete(protect, founder, deleteUser);

module.exports = router;