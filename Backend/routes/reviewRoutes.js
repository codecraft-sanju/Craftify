// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const { getReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware'); // Login check karne ke liye

// Sab dekh sakein (Public)
router.get('/', getReviews);

// Sirf login wale hi post kar sakein (Protected)
router.post('/', protect, createReview);

module.exports = router;