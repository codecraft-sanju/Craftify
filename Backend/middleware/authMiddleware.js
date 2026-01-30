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

            // Get User from the token ID & attach to request object
            // .select('-password') ka matlab password field mat lao
            req.user = await User.findById(decoded.id).select('-password');

            // SAFETY CHECK: If token is valid but user no longer exists in DB
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            next(); // Move to the next function (Controller)
        } catch (error) {
            console.error(error);
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
    // Check if user exists AND is either 'seller' OR 'founder'
    // (Founder should have access to seller features for testing/management)
    if (req.user && (req.user.role === 'seller' || req.user.role === 'founder' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a seller' });
    }
};

// @desc    Founder/Admin Guard
// @usage   Add to routes like "Get All Users", "Delete Shop"
const founder = (req, res, next) => {
    // Checking for 'founder' or 'admin' role
    if (req.user && (req.user.role === 'founder' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as Founder/Admin' });
    }
};

module.exports = { protect, seller, founder };