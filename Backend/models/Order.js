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
        razorpay_order_id: String, 
        razorpay_payment_id: String,
        razorpay_signature: String
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

// --- FIXED: Removed 'next' completely ---
// Changed to async function for consistency
orderSchema.pre('save', async function() {
    if (this.isModified('items')) {
        // Future logic
    }
});

module.exports = mongoose.model('Order', orderSchema);