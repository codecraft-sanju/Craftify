// backend/controllers/chatController.js
const Chat = require('../models/Chat');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const User = require('../models/User');

// @desc    Access a Chat (Create new or Get existing)
// @route   POST /api/chats
// @access  Private
const accessChat = async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        return res.status(400).json({ message: "Product ID param not sent with request" });
    }

    try {
        // 1. Find Product & Shop to identify Seller
        const product = await Product.findById(productId);
        if(!product) return res.status(404).json({ message: "Product not found" });

        const shop = await Shop.findById(product.shop);
        if(!shop) return res.status(404).json({ message: "Shop not found" });

        const sellerId = shop.owner; // The owner of the shop is the Seller

        // 2. Check if Chat already exists between Customer & Seller for THIS Product
        let isChat = await Chat.findOne({
            customer: req.user._id,
            product: productId
        })
        .populate("customer", "name email avatar")
        .populate("seller", "name email avatar")
        .populate("product", "name image coverImage");

        // 3. If Chat exists, return it
        if (isChat) {
            res.send(isChat);
        } else {
            // 4. If Chat doesn't exist, create a new one
            var chatData = {
                customer: req.user._id,
                seller: sellerId,
                product: productId,
                messages: [] // Start empty
            };

            const createdChat = await Chat.create(chatData);

            const FullChat = await Chat.findOne({ _id: createdChat._id })
                .populate("customer", "name email avatar")
                .populate("seller", "name email avatar")
                .populate("product", "name image coverImage");

            // --- SOCKET IO: Notify Seller ---
            if (req.io) {
                req.io.emit('new_chat_started', {
                    chat: FullChat,
                    receiverId: sellerId // Only seller listens
                });
            }

            res.status(200).json(FullChat);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Fetch all chats for the logged-in User (Customer View)
// @route   GET /api/chats/my-chats
// @access  Private
const fetchMyChats = async (req, res) => {
    try {
        // Find chats where user is "customer"
        const results = await Chat.find({ customer: req.user._id })
            .populate("seller", "name avatar") // Show seller name
            .populate("product", "name coverImage") // Show product image
            .sort({ updatedAt: -1 }); // Latest first

        res.status(200).send(results);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Fetch all chats for the Seller (Store Admin View)
// @route   GET /api/chats/shop-chats
// @access  Private (Seller)
const fetchShopChats = async (req, res) => {
    try {
        // Find chats where user is "seller"
        const results = await Chat.find({ seller: req.user._id })
            .populate("customer", "name avatar") // Show customer name
            .populate("product", "name coverImage")
            .sort({ updatedAt: -1 });

        res.status(200).send(results);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Send a Message (Add to message array)
// @route   PUT /api/chats/message
// @access  Private
const sendMessage = async (req, res) => {
    const { chatId, content, type } = req.body; // type: 'text' or 'image'

    if (!chatId || !content) {
        return res.status(400).json({ message: "Invalid data passed into request" });
    }

    try {
        const newMessage = {
            sender: req.user._id,
            text: content, // content can be text string OR image URL
            type: type || 'text',
            readAt: null,
            isRead: false
        };

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { 
                $push: { messages: newMessage },
                lastMessage: type === 'image' ? '📷 Photo' : content,
                lastMessageAt: Date.now()
            },
            { new: true }
        )
        .populate("customer", "name avatar")
        .populate("seller", "name avatar")
        .populate("product", "name coverImage");

        if (!updatedChat) {
            return res.status(404).json({ message: "Chat Not Found" });
        }

        // --- SOCKET IO: REAL TIME MESSAGE ---
        if (req.io) {
            // Broadcast new message to specific chat room
            req.io.emit('new_message_received', {
                chatId: chatId,
                message: updatedChat.messages[updatedChat.messages.length - 1], // The latest message
                sender: req.user._id
            });
            
            // Notification Logic
            const receiverId = req.user._id.toString() === updatedChat.customer._id.toString() 
                ? updatedChat.seller._id 
                : updatedChat.customer._id;

            req.io.emit('notification_received', {
                receiverId: receiverId,
                senderName: req.user.name,
                text: type === 'image' ? 'Sent a photo' : content,
                chatId: chatId
            });
        }

        res.json(updatedChat);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all messages for a specific chat
// @route   GET /api/chats/:chatId
// @access  Private
const getChatMessages = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId)
            .populate("customer", "name avatar")
            .populate("seller", "name avatar")
            .populate("product", "name coverImage");

        if(!chat) return res.status(404).json({ message: "Chat not found" });

        // Security Check: Is user part of this chat?
        const isParticipant = 
            chat.customer._id.toString() === req.user._id.toString() || 
            chat.seller._id.toString() === req.user._id.toString();

        if (!isParticipant) {
            return res.status(401).json({ message: "Not authorized to view this chat" });
        }

        res.json(chat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    accessChat,
    fetchMyChats,
    fetchShopChats,
    sendMessage,
    getChatMessages
};