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
    // Seller's specific status for the item
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
    
    // --- 1. USER PAYMENT INFO (Incoming: Customer -> Founder) ---
    paymentInfo: {
        method: { 
            type: String, 
            enum: ['Online', 'COD'], 
            required: true 
        },
        transactionId: { 
            type: String 
        }, 
        status: {
            type: String,
            enum: ['Pending', 'Verified', 'Failed'],
            default: 'Pending'
        }
    },

    // --- 2. THE GATEKEEPER FIELD (SAFETY LOCK) ---
    // If this is FALSE, the order is HIDDEN from the Seller.
    // Founder must manually switch this to TRUE to reveal the order.
    isVerifiedByFounder: {
        type: Boolean,
        default: false 
    },

    // --- 3. PAYOUT INFO (Outgoing: Founder -> Seller) ---
    // This creates the "Digital Ledger" record accessible by both parties.
    payoutInfo: {
        status: {
            type: String,
            enum: ['Pending', 'Settled'],
            default: 'Pending'
        },
        transactionId: { type: String, default: null }, // Founder's UTR to Seller
        proofImage: { type: String, default: null },    // Screenshot URL
        settledAt: { type: Date }
    },

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
        // Added 'Verifying Payment' as the initial state
        enum: ['Verifying Payment', 'Processing', 'Partially Shipped', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Verifying Payment' 
    },
    
    // --- CANCELLATION FIELDS ---
    cancellationReason: { 
        type: String,
        default: null 
    },
    cancelledAt: { 
        type: Date 
    },
    // ---------------------------

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