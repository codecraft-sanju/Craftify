const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        trim: true
    },
    // Handles different content types (Text, Image, File, or System Notification)
    type: {
        type: String,
        enum: ['text', 'image', 'file', 'system'],
        default: 'text'
    },
    fileUrl: {
        type: String // Universal field for image/file URLs
    },
    // Read Receipts
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    }
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
    // Participants
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Context: What is this chat about?
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
        // Not required: Users might chat about a general shop inquiry, not a specific product
    },
    
    // Status Metadata (Optimization for Inbox View)
    lastMessage: {
        type: String, // Store snippet here to avoid fetching all messages just for the list view
        default: ''
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    unreadCount: {
        customer: { type: Number, default: 0 },
        seller: { type: Number, default: 0 }
    },

    // Blocking mechanism
    isBlocked: {
        type: Boolean,
        default: false
    },
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // The actual conversation
    messages: [messageSchema]

}, { timestamps: true });

// Index for faster queries when loading a user's inbox
// We often query by "find chats where I am the customer OR the seller"
chatSchema.index({ customer: 1, seller: 1 });
chatSchema.index({ lastMessageAt: -1 }); // Useful for sorting inbox by newest

module.exports = mongoose.model('Chat', chatSchema);