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
        index: true 
    },
    brand: {
        type: String
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        maxlength: [9, 'Price cannot exceed 9 figures']
    },
    compareAtPrice: {
        type: Number, 
        default: 0    
    },
    sold: {
        type: Number,
        default: 0 
    },
    sku: {
        type: String, 
        unique: true,
        sparse: true 
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        default: 1
    },
    lowStockThreshold: {
        type: Number,
        default: 5 
    },
    shipping: {
        weight: { type: Number, default: 0 }, 
        dimensions: {
            length: { type: Number, default: 0 },
            width: { type: Number, default: 0 },
            height: { type: Number, default: 0 }
        }
    },
    coverImage: {
        type: String,
        required: true
    },
    images: [
        {
            public_id: { type: String }, 
            url: { type: String, required: true }
        }
    ],
    colors: [String], 
    sizes: [String],
    specs: [{
        key: String,   
        value: String  
    }],
    customizationAvailable: { 
        type: Boolean,
        default: false
    },
    customizationType: { 
        type: String, 
        enum: ['text', 'upload', 'selection', 'none'],
        default: 'none'
    },
    reviews: [reviewSchema],
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }

}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// --- FIXED: Removed 'next' completely ---
// Changed to async function for consistency
productSchema.pre('save', async function() {
    if (!this.isModified('name')) return;
    
    this.slug = this.name
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')      
        .replace(/[^\w\-]+/g, '')  
        .replace(/\-\-+/g, '-')    
        .replace(/^-+/, '')        
        .replace(/-+$/, '');       
});

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