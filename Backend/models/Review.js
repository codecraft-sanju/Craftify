// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    unique: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  image: { 
    type: String, 
    required: true 
  },
  quote: { 
    type: String, 
    required: true,
    maxlength: 200 // Frontend ke sath match karne ke liye limit
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  isVerified: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);