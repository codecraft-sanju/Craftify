const mongoose = require('mongoose');

// Individual Item Schema
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
    
    // User Choices
    selectedColor: { type: String },
    selectedSize: { type: String },
    customization: {
        text: { type: String },
        font: { type: String }
    },
    
    // --- Per-Item Status (Advanced) ---
    // This allows Shop A to ship their item while Shop B is still processing
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

    // --- Logistics ---
    shippingAddress: {
        fullName: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true }
    },

    // --- Financials (Crucial for Analytics) ---
    paymentMethod: {
        type: String,
        enum: ['Card', 'UPI', 'COD', 'PayPal'],
        default: 'Card'
    },
    paymentResult: { 
        id: String,
        status: String,
        update_time: String,
        email_address: String,
        razorpay_order_id: String, // Specific for Razorpay
        razorpay_payment_id: String,
        razorpay_signature: String
    },
    
    // Cost Breakdown
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalAmount: { type: Number, required: true, default: 0.0 },

    // --- Order State Management ---
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: {
        type: Date
    },
    
    // Global Status (Overall order health)
    orderStatus: {
        type: String,
        enum: ['Processing', 'Partially Shipped', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Processing'
    },
    
    // Tracking Logistics
    deliveredAt: { type: Date },
    shippedAt: { type: Date },
    
    // Return Management
    isReturnRequested: {
        type: Boolean,
        default: false
    },
    returnReason: { type: String },
    
    // Order Timeline (For "Track Order" UI)
    timeline: [
        {
            status: { type: String }, // e.g., "Order Placed", "Packed"
            timestamp: { type: Date, default: Date.now },
            description: { type: String }
        }
    ]

}, { timestamps: true });

// Auto-calculate Total Amount before saving (Fail-safe)
orderSchema.pre('save', function(next) {
    if (this.isModified('items')) {
        // You can add logic here to ensure itemsPrice matches the sum of items
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);