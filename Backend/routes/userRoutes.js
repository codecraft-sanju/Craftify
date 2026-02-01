const express = require('express');
const router = express.Router();
const {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser
} = require('../controllers/userController');
const { protect, founder } = require('../middleware/authMiddleware');

// Public
router.post('/login', authUser);

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