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

// Base Ops
router.route('/').post(protect, accessChat); // Start/Get Chat
router.route('/message').put(protect, sendMessage); // Send Msg

// Lists
router.route('/my-chats').get(protect, fetchMyChats); // Customer Inbox
router.route('/shop-chats').get(protect, seller, fetchShopChats); // Seller Inbox

// Dynamic ID (Last)
router.route('/:chatId').get(protect, getChatMessages);

module.exports = router;