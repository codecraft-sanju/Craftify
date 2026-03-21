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
        // --- CHANGES MADE HERE: Added trim and lowercase to standardize all categories ---
        trim: true,
        lowercase: true,
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
    views: {
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
    // --- CHANGES MADE HERE: Updated colors to hold name, hex code, and specific image ---
    colors: [{
        name: { type: String, required: true }, // e.g., "Midnight Black"
        hexCode: { type: String },              // e.g., "#000000"
        imageUrl: { type: String }              // Specific image URL for this color
    }], 
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
        // --- CHANGES MADE HERE: Added 'both' to handle cases where product needs text AND photo ---
        enum: ['text', 'upload', 'selection', 'both', 'none'],
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

// Changed to async function for consistency
productSchema.pre('save', async function() {
    if (!this.isModified('name')) return;
    
    // --- CHANGES MADE HERE: Modified to generate a base slug first ---
    const baseSlug = this.name
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')      
        .replace(/[^\w\-]+/g, '')  
        .replace(/\-\-+/g, '-')    
        .replace(/^-+/, '')        
        .replace(/-+$/, '');       
        
    // --- CHANGES MADE HERE: Added a random string at the end so duplicate product names get unique slugs ---
    const randomString = Math.random().toString(36).substring(2, 7);
    this.slug = `${baseSlug}-${randomString}`;
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