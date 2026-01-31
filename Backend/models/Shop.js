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

// --- FIX: CASCADE DELETE PRODUCTS ---
// Jab Shop delete ho, toh uske saare Products bhi delete ho jayein
shopSchema.pre('findOneAndDelete', async function(next) {
    try {
        // Query execute hone se pehle document nikalo
        const doc = await this.model.findOne(this.getQuery());
        if (doc) {
            console.log(`Deleting products for shop: ${doc.name} (${doc._id})`);
            // Products delete karo
            await mongoose.model('Product').deleteMany({ shop: doc._id });
        }
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Shop', shopSchema);