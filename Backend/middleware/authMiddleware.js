const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Protect routes (Check for valid Cookie)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Read token from cookie named 'jwt'
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
          res.status(401);
          throw new Error('User not found (Account deleted?)');
      }

      next();
    } catch (error) {
      console.error("Auth Error:", error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token (Please login)');
  }
});

// @desc    Seller Guard
const seller = (req, res, next) => {
    if (req.user && (req.user.role === 'seller' || req.user.role === 'founder' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403);
        throw new Error('Access Denied: Sellers only');
    }
};

// @desc    Founder/Admin Guard
const founder = (req, res, next) => {
    if (req.user && (req.user.role === 'founder' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403);
        throw new Error('Access Denied: Founder/Admin only');
    }
};

module.exports = { protect, seller, founder };