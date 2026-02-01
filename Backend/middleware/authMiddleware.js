// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Protect routes (Check for valid JWT Token)
// @usage   Add this to any route that needs login
const protect = async (req, res, next) => {
    let token;

    // Check if Authorization header exists and starts with 'Bearer'
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (Format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Verify Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // ============================================================
            // ⚡ GOD MODE BYPASS (For Founder Access without DB Entry)
            // ============================================================
            if (decoded.id === 'god_admin_001') {
                req.user = {
                    _id: 'god_admin_001',
                    name: 'Sanjay Choudhary',
                    email: 'admin18@gmail.com',
                    role: 'founder', // Full access
                    isAdmin: true
                };
                return next();
            }
            // ============================================================

            // Standard User: Get User from DB
            // .select('-password') ka matlab password field mat lao
            req.user = await User.findById(decoded.id).select('-password');

            // SAFETY CHECK: If token is valid but user no longer exists in DB
            if (!req.user) {
                return res.status(401).json({ message: 'User not found (Account might be deleted)' });
            }

            next(); // Move to the next function (Controller)
            
        } catch (error) {
            console.error("Auth Middleware Error:", error.message);
            // Return here to prevent further execution
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // If no token was found in the header
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// @desc    Seller Guard
// @usage   Add to routes like "Add Product", "Update Shop"
const seller = (req, res, next) => {
    // Access: Seller OR Founder OR Admin
    if (req.user && (req.user.role === 'seller' || req.user.role === 'founder' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access Denied: Sellers only' });
    }
};

// @desc    Founder/Admin Guard
// @usage   Add to routes like "Get All Users", "Delete Shop"
const founder = (req, res, next) => {
    // Access: Founder OR Admin ONLY
    if (req.user && (req.user.role === 'founder' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access Denied: Founder/Admin only' });
    }
};

module.exports = { protect, seller, founder };