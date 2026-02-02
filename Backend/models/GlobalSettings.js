// backend/models/GlobalSettings.js
const mongoose = require('mongoose');

const globalSettingsSchema = new mongoose.Schema({
    // This is the Founder's QR Code shown to customers at checkout
    paymentQrCode: {
        type: String,
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// We ensure only one document exists for settings in the logic
module.exports = mongoose.model('GlobalSettings', globalSettingsSchema);