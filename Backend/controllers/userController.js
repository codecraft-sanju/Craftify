// backend/controllers/userController.js
const User = require('../models/User');
const Shop = require('../models/Shop'); 
const GlobalSettings = require('../models/GlobalSettings'); 
const generateToken = require('../utils/generateToken'); 
const axios = require('axios'); 
const sendEmailOtp = require('../utils/sendEmail'); 

// --- HELPER: Send WhatsApp OTP (Internal) ---
const sendWhatsAppOtp = async (phone, otp) => {
    try {
        const instanceId = process.env.WHATSAPP_INSTANCE_ID;
        const token = process.env.WHATSAPP_TOKEN;

        // Agar keys nahi hain, toh seedha fail return karo taaki Email try ho sake
        if (!instanceId || !token) return false;
        
        const message = `Welcome to *Giftomize*! 🎁\n\nYour OTP is: *${otp}*\n\nValid for 10 minutes.\nDo not share this code.`;
        
        // India code formatting (Remove non-digits, add 91 if 10 digits)
        let formattedPhone = phone.toString().replace(/\D/g, ''); 
        if (formattedPhone.length === 10) {
            formattedPhone = "91" + formattedPhone;
        }

        const payload = new URLSearchParams({
            token: token,
            to: formattedPhone,
            body: message
        });

        const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
        
        await axios.post(url, payload, {
            headers: { 'content-type': 'application/x-www-form-urlencoded' }
        });

        console.log(`✅ WhatsApp OTP Sent to ${formattedPhone}`);
        return true;

    } catch (error) {
        // Error log karo par crash mat hone do, false return karo taaki Email logic chale
        console.warn("⚠️ WhatsApp Send Failed (Will try Email):", error.message);
        return false;
    }
};

// @desc    Register a new user & Send OTP (Smart Failover with Strict Validation)
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // 1. --- STRICT VALIDATION ---
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'Please fill in all fields.' });
        }

        // Email Format Check (Regex)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }

        // Phone Length Check (Indian numbers usually)
        const cleanPhone = phone.toString().replace(/\D/g, '');
        if (cleanPhone.length < 10 || cleanPhone.length > 15) {
             return res.status(400).json({ message: 'Please enter a valid phone number (10 digits).' });
        }

        // 2. --- DUPLICATE CHECK ---
        const userExists = await User.findOne({ 
            $or: [{ email: email }, { phone: phone }] 
        });

        if (userExists) {
            if (userExists.email === email) return res.status(400).json({ message: 'This Email is already registered.' });
            if (userExists.phone === phone) return res.status(400).json({ message: 'This Phone Number is already registered.' });
        }

        // 3. --- ROLE ASSIGNMENT ---
        let userRole = 'customer';
        if (email.toLowerCase() === 'admin@gmail.com') {
            userRole = 'founder';
        } else if (role === 'seller') {
            userRole = 'seller';
        }

        // 4. --- CHECK .ENV CONFIGURATION ---
        const otpService = process.env.OTP_SERVICE || 'email'; // Default is email if not set

        // ============================================================
        // CASE A: NO OTP (DIRECT REGISTRATION)
        // ============================================================
        if (otpService === 'none') {
            console.log("🚀 OTP Service is NONE. Direct Registration...");
            
            const user = await User.create({
                name,
                email,
                phone,
                password,
                role: userRole,
                avatar: name.charAt(0).toUpperCase(),
                isPhoneVerified: true, // Auto Verified
                // otp field ki jarurat nahi
            });

            if (user) {
                generateToken(res, user._id); // Auto Login
                return res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    avatar: user.avatar,
                    shop: null,
                    otpMethod: 'none',
                    message: "Registration Successful! (Direct Login)"
                });
            }
        }

        // ============================================================
        // CASE B: OTP REQUIRED (WhatsApp or Email)
        // ============================================================
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes expiry

        // Create User (Pending Verification)
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
            let otpMethod = 'none'; 
            let isOtpSent = false;

            if (otpService === 'whatsapp') {
                // Priority: WhatsApp
                isOtpSent = await sendWhatsAppOtp(phone, otp);
                if (isOtpSent) {
                    otpMethod = 'whatsapp';
                } else {
                    // Fallback: Email if WhatsApp fails
                    console.log("⚠️ WhatsApp failed. Switching to Email...");
                    isOtpSent = await sendEmailOtp(email, otp);
                    if (isOtpSent) otpMethod = 'email';
                }
            } else {
                // Default: Email Only
                console.log("📧 Using Email OTP Service");
                isOtpSent = await sendEmailOtp(email, otp);
                if (isOtpSent) otpMethod = 'email';
            }

            // Final Status Check
            if (isOtpSent) {
                res.status(201).json({
                    success: true,
                    userId: user._id,
                    phone: phone,
                    email: email,
                    otpMethod: otpMethod,
                    message: otpMethod === 'whatsapp' 
                        ? `OTP sent via WhatsApp to ${phone}` 
                        : `OTP sent to Email ${email}`
                });
            } else {
                // Critical Fail: Delete user so they can retry
                console.error("❌ All OTP Services Failed. Deleting User.");
                await User.deleteOne({ _id: user._id });
                return res.status(503).json({ 
                    message: "Verification service unavailable. Please try again later." 
                });
            }

        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }

    } catch (error) {
        console.error("Register Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User details already exist.' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP & Create Shop (Atomic Operation)
// @route   POST /api/users/verify-otp
// @access  Public
const verifyUserOtp = async (req, res) => {
    let createdShop = null; // Track created shop for rollback

    try {
        const { phone, otp, shopName, description, categories } = req.body;

        // 1. User dhoondo
        const user = await User.findOne({ phone }).select('+otp');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. OTP Check
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP. Please check and try again." });
        }

        if (user.otpExpire < Date.now()) {
            return res.status(400).json({ message: "OTP has Expired. Please login again." });
        }

        // --- NEW LOGIC: Shop Creation (If Details Provided) ---
        if (shopName) {
            // Check Duplicate Shop Name BEFORE verifying user
            const shopExists = await Shop.findOne({ name: shopName });
            if (shopExists) {
                return res.status(400).json({ message: "Shop Name is already taken. Please choose another." });
            }

            // Create Shop
            createdShop = await Shop.create({
                name: shopName,
                description: description || 'Welcome to my shop',
                phone: phone,
                categories: categories || [],
                owner: user._id,
                isActive: true
            });
        }

        // 3. Success: User Update (Link Shop & Verify)
        user.isPhoneVerified = true; 
        user.otp = undefined;
        user.otpExpire = undefined;
        
        if (createdShop) {
            user.shop = createdShop._id; // User model me shop ID save karo
            user.role = 'seller'; // Ensure role is seller
        }
        
        await user.save();

        // Generate Token
        generateToken(res, user._id);

        // Socket Notification
        if (req.io) {
            req.io.emit('new_user_registered', {
                _id: user._id,
                name: user.name,
                role: user.role
            });
            if (createdShop) {
                req.io.emit('shop_created', {
                    _id: createdShop._id,
                    name: createdShop.name,
                    ownerName: user.name
                });
            }
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            shop: createdShop ? createdShop._id : null,
            message: createdShop ? "Account & Shop Created Successfully!" : "Verification Successful!"
        });

    } catch (error) {
        console.error("Verify Error:", error);
        
        // --- ROLLBACK LOGIC ---
        if (createdShop) {
            await Shop.findByIdAndDelete(createdShop._id);
            console.log("⚠️ Rolled back shop creation due to verification error.");
        }

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
                shop: user.shop, // Return Shop ID for frontend checks
                address: user.address,
                phone: user.phone
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
                address: user.address,
                shop: user.shop
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
            user.phone = req.body.phone || user.phone; 
            
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
    verifyUserOtp,
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