const express = require('express');
const router = express.Router();
const {
    accessChat,
    fetchMyChats,
    fetchShopChats,
    sendMessage,
    getChatMessages
} = require('../controllers/chatController');
const { protect, seller } = require('../middleware/authMiddleware');

// Start or Get Chat
router.route('/').post(protect, accessChat);

// Chat Lists
router.route('/my-chats').get(protect, fetchMyChats); // For Customer
router.route('/shop-chats').get(protect, seller, fetchShopChats); // For Seller

// Messaging
router.route('/message').put(protect, sendMessage);
router.route('/:chatId').get(protect, getChatMessages);

module.exports = router;