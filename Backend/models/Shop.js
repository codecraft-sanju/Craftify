const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please enter a shop name'],
        trim: true,
        maxlength: [50, 'Shop name cannot exceed 50 characters']
    },
    // Slug for SEO-friendly URLs (e.g., mysite.com/shop/sanjays-electronics)
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true
    },
    description: {
        type: String,
        required: [true, 'Please enter a description'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    // Branding
    logo: {
        type: String,
        default: 'no-photo.jpg' // Better to have a distinct default
    },
    coverImage: {
        type: String, // Banner image for shop profile
        default: 'no-cover.jpg'
    },
    // Verification Status (Crucial for platform trust)
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    
    // --- Contact & Location ---
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    // Detailed Address
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    // GeoJSON for "Find Shops Near Me" functionality
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [Longitude, Latitude]
            index: '2dsphere' // Critical for geospatial queries
        },
        formattedAddress: String
    },

    // --- Business Logic ---
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating must can not be more than 5'],
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    socialLinks: {
        facebook: String,
        instagram: String,
        twitter: String,
        youtube: String
    },
    // Store Categories (e.g., Electronics, Fashion)
    categories: [{
        type: String,
        required: true
    }]

}, { 
    timestamps: true,
    toJSON: { virtuals: true }, // Ensure virtuals show up when sending JSON
    toObject: { virtuals: true }
});

// Create shop slug from the name before saving
shopSchema.pre('save', function(next) {
    if (!this.isModified('name')) {
        next();
    }
    // Simple slugify logic: "Sanjay's Shop" -> "sanjays-shop"
    this.slug = this.name
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')       // Replace spaces with -
        .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
        .replace(/\-\-+/g, '-')     // Replace multiple - with single -
        .replace(/^-+/, '')         // Trim - from start of text
        .replace(/-+$/, '');        // Trim - from end of text
    
    next();
});

// Cascade delete: Delete products when a shop is deleted
shopSchema.pre('remove', async function(next) {
    console.log(`Products being removed from shop ${this._id}`);
    await this.model('Product').deleteMany({ shop: this._id });
    next();
});

module.exports = mongoose.model('Shop', shopSchema);