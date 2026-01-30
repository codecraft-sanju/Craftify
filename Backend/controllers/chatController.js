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
        // 1. Product dhundo taaki Seller (Shop Owner) ka pata chale
        const product = await Product.findById(productId);
        if(!product) return res.status(404).json({ message: "Product not found" });

        const shop = await Shop.findById(product.shop);
        if(!shop) return res.status(404).json({ message: "Shop not found" });

        const sellerId = shop.owner; // Shop ka owner hi Seller hai

        // 2. Check karo ki kya Customer aur Seller ke beech IS Product ke liye pehle se chat hai?
        let isChat = await Chat.findOne({
            customer: req.user._id,
            product: productId
        })
        .populate("customer", "name email avatar")
        .populate("seller", "name email avatar")
        .populate("product");

        // 3. Agar Chat hai, toh wahi return karo
        if (isChat) {
            res.send(isChat);
        } else {
            // 4. Agar Chat nahi hai, toh Nayi Chat Create karo
            var chatData = {
                customer: req.user._id,
                seller: sellerId,
                product: productId,
                messages: [] // Empty start
            };

            const createdChat = await Chat.create(chatData);

            const FullChat = await Chat.findOne({ _id: createdChat._id })
                .populate("customer", "name email avatar")
                .populate("seller", "name email avatar")
                .populate("product");

            // --- SOCKET IO: Notify Seller of New Inquiry ---
            // Seller ke inbox me nayi chat turant dikhni chahiye
            if (req.io) {
                req.io.emit('new_chat_started', {
                    chat: FullChat,
                    receiverId: sellerId // Only the seller should react to this
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
        // Woh chats dhundo jaha user "customer" hai
        const results = await Chat.find({ customer: req.user._id })
            .populate("seller", "name avatar") // Seller ka naam dikhana hai list me
            .populate("product", "name image") // Product ki photo dikhani hai
            .sort({ updatedAt: -1 }); // Latest chat upar

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
        // Woh chats dhundo jaha user "seller" hai
        const results = await Chat.find({ seller: req.user._id })
            .populate("customer", "name avatar") // Customer ka naam dikhana hai
            .populate("product", "name image")
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
    const { chatId, content, type } = req.body; // type can be 'text' or 'image'

    if (!chatId || !content) {
        return res.status(400).json({ message: "Invalid data passed into request" });
    }

    try {
        // Naya message object banayein
        const newMessage = {
            sender: req.user._id,
            text: content, // Agar image hai toh URL yahan aayega, frontend logic ke hisaab se
            type: type || 'text',
        };

        // Chat dhundo aur message array me push karo
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { 
                $push: { messages: newMessage },
                lastMessage: content, // Optimization for inbox view
                lastMessageAt: Date.now()
            },
            { new: true } // Return updated document
        )
        .populate("customer", "name avatar")
        .populate("seller", "name avatar")
        .populate("product");

        if (!updatedChat) {
            res.status(404);
            throw new Error("Chat Not Found");
        }

        // --- SOCKET IO: REAL TIME MESSAGE ---
        // Pura updated chat object ya sirf naya message bhej sakte hain
        if (req.io) {
            // Hum ek specific event emit karenge jisme Chat ID aur Message hoga
            req.io.emit('new_message_received', {
                chatId: chatId,
                message: updatedChat.messages[updatedChat.messages.length - 1], // The last message added
                sender: req.user._id,
                // Receiver ko pata lagane ke liye logic frontend pe bhi ho sakta hai ya yahan
                // Usually client side check karta hai: "Agar main is chat room me hoon, to append karo"
            });
            
            // Optional: Notification Event (Agar user chat khol ke nahi baitha hai)
            const receiverId = req.user._id.toString() === updatedChat.customer._id.toString() 
                ? updatedChat.seller._id 
                : updatedChat.customer._id;

            req.io.emit('notification_received', {
                receiverId: receiverId,
                senderName: req.user.name,
                text: content
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
            .populate("seller", "name avatar");

        if(!chat) return res.status(404).json({ message: "Chat not found" });

        // Security Check: Kya user is chat ka hissa hai?
        // Convert ObjectIDs to string for comparison
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