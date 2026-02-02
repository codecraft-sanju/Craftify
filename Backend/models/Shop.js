// backend/models/Shop.js
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
    logo: {
        type: String,
        default: 'no-photo.jpg' 
    },
    coverImage: {
        type: String, 
        default: 'no-cover.jpg'
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    isActive: {
        type: Boolean,
        default: true
    },
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
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], 
            index: '2dsphere' 
        },
        formattedAddress: String
    },
    rating: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
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
    
    // --- NEW FIELD: SELLER QR CODE ---
    // Sellers upload their QR here so you (Admin) can pay them.
    paymentQrCode: { 
        type: String,
        default: '' 
    },
    // ---------------------------------

    categories: [{
        type: String,
        required: true
    }]

}, { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

// --- SLUG GENERATION ---
shopSchema.pre('save', async function() {
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

// --- CASCADE DELETE PRODUCTS ---
// When a Shop is deleted, delete all associated Products
shopSchema.pre('findOneAndDelete', async function(next) {
    try {
        const doc = await this.model.findOne(this.getQuery());
        if (doc) {
            console.log(`Deleting products for shop: ${doc.name} (${doc._id})`);
            await mongoose.model('Product').deleteMany({ shop: doc._id });
        }
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Shop', shopSchema);