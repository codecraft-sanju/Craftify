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
        font: { type: String },
        // --- CHANGES MADE HERE: Added photoUrl to pass the uploaded image to the seller ---
        photoUrl: { type: String }
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
    
    // --- 1. USER PAYMENT INFO (Incoming: Customer -> Founder via Razorpay) ---
    // CHANGES MADE: Updated to store Razorpay specific details
    paymentInfo: {
        method: { 
            type: String, 
            enum: ['Online', 'COD'], 
            required: true,
            default: 'Online' // Ab Razorpay hai toh default Online rahega
        },
        razorpayPaymentId: {  // Naya field Razorpay payment ID ke liye
            type: String 
        }, 
        razorpayOrderId: {    // Naya field Razorpay order ID ke liye
            type: String 
        },
        status: {
            type: String,
            enum: ['Pending', 'Success', 'Failed'], // 'Verified' ko 'Success' kar diya
            default: 'Pending'
        }
    },

    // --- 2. THE GATEKEEPER FIELD (SAFETY LOCK) ---
    isVerifiedByFounder: {
        type: Boolean,
        default: false 
    },

    // --- 3. PAYOUT INFO (Outgoing: Founder -> Seller) ---
    payoutInfo: {
        status: {
            type: String,
            enum: ['Pending', 'Settled'],
            default: 'Pending'
        },
        transactionId: { type: String, default: null },
        proofImage: { type: String, default: null },
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
        enum: ['Verifying Payment', 'Processing', 'Partially Shipped', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Verifying Payment' 
    },
    
    cancellationReason: { 
        type: String,
        default: null 
    },
    cancelledAt: { 
        type: Date 
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

orderSchema.pre('save', async function() {
    if (this.isModified('items')) {
        // Future logic
    }
});

module.exports = mongoose.model('Order', orderSchema);