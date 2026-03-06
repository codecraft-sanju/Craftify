// models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { 
        type: Number, 
        required: true, 
        default: 1,
        min: [1, 'Quantity cannot be less than 1'] 
    },
    selectedSize: { type: String },
    selectedColor: { type: String },
    customization: {
        text: { type: String },
        font: { type: String }
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalPrice: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

cartSchema.pre('save', async function() {
    this.totalPrice = this.items.reduce((acc, item) => {
        return acc + (item.price * item.qty);
    }, 0);
});

module.exports = mongoose.model('Cart', cartSchema);