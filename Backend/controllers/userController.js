const User = require('../models/User');
const Shop = require('../models/Shop'); 
const GlobalSettings = require('../models/GlobalSettings'); 
const generateToken = require('../utils/generateToken'); 
// Removed axios and sendEmail as they are no longer needed for OTP

// @desc    Register a new user (Direct Registration & Optional Shop Creation)
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    try {
        // We now accept shop details here directly since there is no second verification step
        const { name, email, password, phone, role, shopName, description, categories } = req.body;

        // 1. --- STRICT VALIDATION ---
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'Please fill in all fields.' });
        }

        // Email Format Check (Regex)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }

        // Phone Length Check
        const cleanPhone = phone.toString().replace(/\D/g, '');
        if (cleanPhone.length < 10 || cleanPhone.length > 15) {
             return res.status(400).json({ message: 'Please enter a valid phone number (10 digits).' });
        }

        // 2. --- DUPLICATE CHECK (User) ---
        const userExists = await User.findOne({ 
            $or: [{ email: email }, { phone: phone }] 
        });

        if (userExists) {
            if (userExists.email === email) return res.status(400).json({ message: 'This Email is already registered.' });
            if (userExists.phone === phone) return res.status(400).json({ message: 'This Phone Number is already registered.' });
        }

        // 3. --- DUPLICATE CHECK (Shop - if applicable) ---
        if (shopName) {
            const shopExists = await Shop.findOne({ name: shopName });
            if (shopExists) {
                return res.status(400).json({ message: "Shop Name is already taken. Please choose another." });
            }
        }

        // 4. --- ROLE ASSIGNMENT ---
        let userRole = 'customer';
        if (email.toLowerCase() === 'admin@gmail.com') {
            userRole = 'founder';
        } else if (role === 'seller' || shopName) {
            userRole = 'seller';
        }

        // 5. --- CREATE USER (Direct) ---
        const user = await User.create({
            name,
            email,
            phone,
            password,
            role: userRole,
            avatar: name.charAt(0).toUpperCase(),
            isPhoneVerified: true, // Auto Verified since OTP is removed
            // No OTP fields needed
        });

        if (user) {
            let createdShop = null;

            // 6. --- CREATE SHOP (If details provided) ---
            if (shopName) {
                createdShop = await Shop.create({
                    name: shopName,
                    description: description || 'Welcome to my shop',
                    phone: phone,
                    categories: categories || [],
                    owner: user._id,
                    isActive: true
                });

                // Link Shop to User
                user.shop = createdShop._id;
                user.role = 'seller'; // Ensure role is seller
                await user.save();
            }

            // 7. --- GENERATE TOKEN & NOTIFY ---
            generateToken(res, user._id); // Auto Login

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

            // 8. --- SEND RESPONSE ---
            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                shop: createdShop ? createdShop._id : null,
                message: createdShop ? "Account & Shop Created Successfully!" : "Registration Successful!"
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }

    } catch (error) {
        console.error("Register Error:", error);
        // Rollback Shop if user creation failed (unlikely here due to order, but good practice)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User details already exist.' });
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