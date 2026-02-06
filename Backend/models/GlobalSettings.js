const mongoose = require('mongoose');

const globalSettingsSchema = new mongoose.Schema({
    // This is the Founder's QR Code shown to customers at checkout
    paymentQrCode: {
        type: String,
        required: false,
        default: ""
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // --- Category Images Map (Existing) ---
    categoryImages: {
        type: Map,
        of: String,
        default: {
            "All": "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=2070&auto=format&fit=crop"
        }
    },

    // --- NEW: Offer Carousel Settings ---
    offerCarousel: {
        // Master Switch: Agar false hai, toh pura section gayab ho jayega
        isVisible: {
            type: Boolean,
            default: true 
        },
        // Slides ka Array: Jitni marzi images add karo
        slides: [
            {
                image: { type: String, required: true }, // Image URL
                title: { type: String, default: "" },    // "Super Sale"
                subtitle: { type: String, default: "" }, // "50% Off"
                isActive: { type: Boolean, default: true } // Single slide ko hide karne ke liye
            }
        ]
    }

}, { timestamps: true });

module.exports = mongoose.model('GlobalSettings', globalSettingsSchema);