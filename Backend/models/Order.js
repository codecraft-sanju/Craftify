// backend/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, default: 1 },
    selectedColor: { type: String },
    selectedSize: { type: String },
    customization: {
        text: { type: String },
        font: { type: String }
    },
    status: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
        default: 'Processing'
    }
});

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    shippingAddress: {
        fullName: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true }
    },
    
    // --- NEW: PAYMENT INFO SECTION ---
    paymentInfo: {
        method: { 
            type: String, 
            enum: ['Online', 'COD'], 
            required: true 
        },
        // Store the Transaction ID / UTR provided by the customer
        transactionId: { 
            type: String 
        }, 
        status: {
            type: String,
            enum: ['Pending', 'Verified', 'Failed'],
            default: 'Pending'
        }
    },
    // ---------------------------------

    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalAmount: { type: Number, required: true, default: 0.0 },
    
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: {
        type: Date
    },
    orderStatus: {
        type: String,
        enum: ['Processing', 'Partially Shipped', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Processing'
    },
    deliveredAt: { type: Date },
    shippedAt: { type: Date },
    isReturnRequested: {
        type: Boolean,
        default: false
    },
    returnReason: { type: String },
    timeline: [
        {
            status: { type: String }, 
            timestamp: { type: Date, default: Date.now },
            description: { type: String }
        }
    ]

}, { timestamps: true });

// --- Pre-save hook ---
orderSchema.pre('save', async function() {
    if (this.isModified('items')) {
        // Future logic
    }
});

module.exports = mongoose.model('Order', orderSchema);