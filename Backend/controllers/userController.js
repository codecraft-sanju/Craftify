const User = require('../models/User');
const GlobalSettings = require('../models/GlobalSettings'); 
const generateToken = require('../utils/generateToken'); 
const axios = require('axios'); // WhatsApp API ke liye zaroori hai

// --- HELPER: Send WhatsApp OTP (UPDATED & FIXED) ---
const sendWhatsAppOtp = async (phone, otp) => {
    try {
        // 1. Credentials Load
        const instanceId = process.env.WHATSAPP_INSTANCE_ID;
        const token = process.env.WHATSAPP_TOKEN;

        console.log("DEBUG: WhatsApp Instance:", instanceId ? "Loaded" : "Missing");

        if (!instanceId || !token) {
            console.error("❌ ERROR: WhatsApp Instance ID or Token is MISSING in .env");
            return false;
        }
        
        const message = `Welcome to *Giftomize* – Where Gifting Meets Personalization! 🎁\n\nThank you for choosing us. To complete your registration and secure your account, please use the following One-Time Password (OTP):\n\n👉 *${otp}*\n\n⏳ This code is valid for the next 10 minutes.\n\n⚠️ *Security Alert:* For your safety, please do not share this code with anyone, including Giftomize support staff.\n\nWe are excited to have you on board!\n\nBest Regards,\n*Team Giftomize*`;
        
        // 2. Phone Formatting (India Code Fix)
        let formattedPhone = phone.toString().replace(/\D/g, ''); 
        if (formattedPhone.length === 10) {
            formattedPhone = "91" + formattedPhone;
        }

        // 3. API Request (Using URLSearchParams for better compatibility)
        const payload = new URLSearchParams({
            token: token,
            to: formattedPhone,
            body: message
        });

        const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
        
        const response = await axios.post(url, payload, {
            headers: { 'content-type': 'application/x-www-form-urlencoded' }
        });

        console.log("✅ WhatsApp OTP Sent successfully");
        return true;

    } catch (error) {
        console.error("❌ WhatsApp Send Error:", error.message);
        if (error.response) {
            console.error("API Response Data:", JSON.stringify(error.response.data, null, 2));
            console.error("API Status:", error.response.status);
        }
        return false;
    }
};

// @desc    Register a new user & Send WhatsApp OTP
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // 1. Basic Validation
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'Please add all fields including Phone Number' });
        }

        // 2. Check if User Exists (Email or Phone)
        const userExists = await User.findOne({ 
            $or: [{ email: email }, { phone: phone }] 
        });

        if (userExists) {
            return res.status(400).json({ message: 'User with this Email or Phone already exists' });
        }

        // 3. Generate 6 Digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes expiry

        // 4. Role Assignment
        let userRole = 'customer';
        if (email.toLowerCase() === 'admin@gmail.com') {
            userRole = 'founder';
        } else if (role === 'seller') {
            userRole = 'seller';
        }

        // 5. Create User (Not Verified Yet)
        const user = await User.create({
            name,
            email,
            phone,
            password,
            role: userRole,
            avatar: name.charAt(0).toUpperCase(),
            otp: otp,
            otpExpire: otpExpire,
            isPhoneVerified: false 
        });

        if (user) {
            // 6. Send OTP via WhatsApp
            const isSent = await sendWhatsAppOtp(phone, otp);

            if (isSent) {
                res.status(201).json({
                    message: `OTP sent successfully to ${phone}. Please verify to login.`,
                    phone: phone, // Frontend ko phone bhejo taki wo verify screen pe dikha sake
                    userId: user._id
                });
            } else {
                // Agar WhatsApp fail ho jaye, toh error dikhana chahiye
                res.status(500).json({ message: "User created but failed to send WhatsApp OTP. Please check backend logs." });
            }
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP & Login User
// @route   POST /api/users/verify-otp
// @access  Public
const verifyUserOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        // Find user by phone and include 'otp' field (kyunki model me select: false hai)
        const user = await User.findOne({ phone }).select('+otp');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check Logic
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpire < Date.now()) {
            return res.status(400).json({ message: "OTP Expired. Please try to login again to resend." });
        }

        // Success: Verify User & Clear OTP
        user.isPhoneVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        // Generate Token (Login karwa do)
        generateToken(res, user._id);

        // Socket Notification (Optional)
        if (req.io) {
            req.io.emit('new_user_registered', {
                _id: user._id,
                name: user.name,
                role: user.role
            });
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            message: "Verification Successful!"
        });

    } catch (error) {
        console.error("Verify Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate user & set Cookie
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            
            // --- CHECK: Is Verified? ---
            // Agar aap chahte hain bina verification ke login na ho, toh ye uncomment karein:
            /*
            if (!user.isPhoneVerified) {
                return res.status(401).json({ message: 'Please verify your phone number first.' });
            }
            */

            // --- GOD MODE FIX ---
            if (user.email === 'admin@gmail.com' && user.role !== 'founder') {
                user.role = 'founder';
                await user.save();
            }

            if (req.io) {
                req.io.emit('user_login', { 
                    userId: user._id, 
                    name: user.name, 
                    role: user.role 
                });
            }

            generateToken(res, user._id);

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                address: user.address,
                phone: user.phone // Added phone to response
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0), 
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                address: user.address
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone; // Allow phone update
            
            if (req.body.password) {
                user.password = req.body.password;
            }
            if (req.body.avatar) {
                user.avatar = req.body.avatar;
            }

            const updatedUser = await user.save();
            
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- ADMIN / FOUNDER FUNCTIONS ---

const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- GLOBAL SETTINGS: QR, CATEGORIES & OFFERS ---

// 1. Get Global QR Code (Public)
const getGlobalQR = async (req, res) => {
    try {
        let settings = await GlobalSettings.findOne();
        if (!settings) return res.json({ qrCode: null });
        res.json({ qrCode: settings.paymentQrCode });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Update Global QR Code (Founder)
const updateGlobalQR = async (req, res) => {
    try {
        const { qrUrl } = req.body;
        if (!qrUrl) return res.status(400).json({ message: "QR URL is required" });

        const updatedSettings = await GlobalSettings.findOneAndUpdate(
            {}, 
            { paymentQrCode: qrUrl, updatedBy: req.user._id },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.status(201).json(updatedSettings);
    } catch (error) {
        console.error("QR Update Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// 3. Get Category Images (Public)
const getCategoryImages = async (req, res) => {
    try {
        let settings = await GlobalSettings.findOne();
        if (!settings) {
            return res.json({ 
                "All": "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=2070&auto=format&fit=crop" 
            });
        }
        res.json(settings.categoryImages);
    } catch (error) {
        console.error("Get Cat Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// 4. Update Category Image (Founder)
const updateCategoryImage = async (req, res) => {
    const { category, imageUrl } = req.body;
    
    if (!category || !imageUrl) {
        return res.status(400).json({ message: "Category and Image URL are required" });
    }

    try {
        let settings = await GlobalSettings.findOne();
        if (!settings) settings = new GlobalSettings();
        if (!settings.categoryImages) settings.categoryImages = new Map();

        settings.categoryImages.set(category, imageUrl);
        settings.updatedBy = req.user._id;
        
        await settings.save();

        res.json(settings.categoryImages);
    } catch (error) {
        console.error("Cat Update Error:", error);
        res.status(500).json({ message: "Failed to update category image" });
    }
};

// 5. Get Offer Banners (Public)
const getOfferBanners = async (req, res) => {
    try {
        const settings = await GlobalSettings.findOne();
        
        if (!settings || !settings.offerCarousel) {
            return res.json(null); 
        }

        res.json({
            isVisible: settings.offerCarousel.isVisible,
            slides: settings.offerCarousel.slides.filter(slide => slide.isActive)
        });

    } catch (error) {
        console.error("Get Banners Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// 6. Update Offer Banners (Founder)
const updateOfferBanners = async (req, res) => {
    try {
        const { isVisible, slides } = req.body;

        const updatedSettings = await GlobalSettings.findOneAndUpdate(
            {},
            {
                $set: {
                    "offerCarousel.isVisible": isVisible,
                    "offerCarousel.slides": slides
                },
                updatedBy: req.user._id
            },
            { new: true, upsert: true }
        );

        res.json(updatedSettings.offerCarousel);
    } catch (error) {
        console.error("Update Banners Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- WISHLIST FUNCTIONS ---

// Get User Wishlist
const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        if (user) res.json(user.wishlist);
        else res.status(404).json({ message: 'User not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add to Wishlist
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { wishlist: productId } },
            { new: true }
        ).populate('wishlist');
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove from Wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const productId = req.params.id;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { wishlist: productId } },
            { new: true }
        ).populate('wishlist');
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    verifyUserOtp, // Add this to exports
    authUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
    getGlobalQR,
    updateGlobalQR,
    getCategoryImages,   
    updateCategoryImage,
    getOfferBanners,     
    updateOfferBanners,  
    getWishlist,
    addToWishlist,
    removeFromWishlist
};