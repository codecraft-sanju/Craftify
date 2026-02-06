const mongoose = require('mongoose');

const globalSettingsSchema = new mongoose.Schema({
    // This is the Founder's QR Code shown to customers at checkout
    paymentQrCode: {
        type: String,
        required: false, // Recommended: false rakho taaki bina QR ke bhi settings ban sakein
        default: ""
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // --- NEW: Category Images Map ---
    categoryImages: {
        type: Map,
        of: String,
        default: {
            "All": "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=2070&auto=format&fit=crop"
        }
    }
}, { timestamps: true });

// Ensure only one document exists logic is handled in controller
module.exports = mongoose.model('GlobalSettings', globalSettingsSchema);