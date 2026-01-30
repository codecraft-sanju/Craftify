const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true
    },
    // SEO Friendly URL (e.g., /product/custom-neon-sign-blue)
    slug: {
        type: String,
        lowercase: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        required: [true, 'Please enter product description']
    },
    category: {
        type: String,
        required: [true, 'Please enter product category'],
        index: true // Helps filter faster
    },
    brand: {
        type: String
    },

    // --- Pricing & Sales ---
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        maxlength: [9, 'Price cannot exceed 9 figures']
    },
    compareAtPrice: {
        type: Number, // The "Original" price before discount
        default: 0    // If price is 100 and compareAt is 150, frontend shows 33% OFF
    },
    sold: {
        type: Number,
        default: 0 // Track sales to show "Popular" or "Best Selling"
    },

    // --- Inventory & Logistics ---
    sku: {
        type: String, // Stock Keeping Unit (unique ID for warehouse)
        unique: true
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        default: 1
    },
    lowStockThreshold: {
        type: Number,
        default: 5 // Alert seller when stock drops below this
    },
    shipping: {
        weight: { type: Number, default: 0 }, // in grams
        dimensions: {
            length: { type: Number, default: 0 },
            width: { type: Number, default: 0 },
            height: { type: Number, default: 0 }
        }
    },

    // --- Media ---
    // Main display image
    coverImage: {
        type: String,
        required: true
    },
    // Gallery images
    images: [
        {
            public_id: { type: String, required: true },
            url: { type: String, required: true }
        }
    ],

    // --- Attributes & Variants ---
    colors: [String], 
    sizes: [String],
    specs: [{
        key: String,   // e.g., "Material"
        value: String  // e.g., "100% Cotton"
    }],

    // --- Customization Logic (Advanced) ---
    isCustomizable: {
        type: Boolean,
        default: false
    },
    customizationOptions: {
        type: {
            type: String, // 'text', 'upload', 'selection'
            enum: ['text', 'upload', 'selection', 'none'],
            default: 'none'
        },
        instruction: String, // "Enter the name to be engraved"
        extraFee: { type: Number, default: 0 }, // Cost for customization
        required: { type: Boolean, default: false }
    },

    // --- Social Proof ---
    reviews: [reviewSchema],
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    
    // Soft Delete (Don't actually delete products, just hide them)
    isActive: {
        type: Boolean,
        default: true
    }

}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create slug from name
productSchema.pre('save', function(next) {
    if (!this.isModified('name')) {
        next();
    }
    this.slug = this.name.toLowerCase().split(' ').join('-');
    next();
});

// Update Average Rating after saving a review
// Note: This requires complex aggregation, simplified here for understanding
productSchema.methods.calculateRating = function() {
    if (this.reviews.length === 0) {
        this.rating = 0;
        this.numReviews = 0;
    } else {
        const total = this.reviews.reduce((acc, item) => item.rating + acc, 0);
        this.rating = total / this.reviews.length;
        this.numReviews = this.reviews.length;
    }
};

module.exports = mongoose.model('Product', productSchema);