// backend/controllers/userController.js
const User = require('../models/User');
// --- NEW IMPORT: GLOBAL SETTINGS ---
const GlobalSettings = require('../models/GlobalSettings'); 
// -----------------------------------
const generateToken = require('../utils/generateToken'); 

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // --- AUTOMATIC FOUNDER ASSIGNMENT ---
        let role = 'customer';
        if (email.toLowerCase() === 'admin@gmail.com') {
            role = 'founder';
        } else if (req.body.role === 'seller') {
            role = 'seller';
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            avatar: name.charAt(0).toUpperCase()
        });

        if (user) {
            generateToken(res, user._id);

            if (req.io) {
                req.io.emit('new_user_registered', {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                });
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Register Error:", error);
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
                address: user.address
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

// --- NEW: FOUNDER QR CODE FUNCTIONS (Integrated here) ---

// @desc    Get Global QR Code (Public - for Customers)
// @route   GET /api/users/qr
const getGlobalQR = async (req, res) => {
    try {
        // Fetch the latest QR code
        const settings = await GlobalSettings.findOne().sort({ createdAt: -1 });
        if (settings) {
            res.json({ qrCode: settings.paymentQrCode });
        } else {
            res.json({ qrCode: null });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update/Upload Founder QR (Private - Founder Only)
// @route   POST /api/users/qr
const updateGlobalQR = async (req, res) => {
    try {
        const { qrUrl } = req.body;
        
        if (!qrUrl) {
            return res.status(400).json({ message: "QR URL is required" });
        }

        // Logic: Always keep only 1 document for simplicity (Singleton)
        await GlobalSettings.deleteMany({}); 
        
        const newSettings = await GlobalSettings.create({
            paymentQrCode: qrUrl,
            updatedBy: req.user._id
        });

        res.status(201).json(newSettings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- NEW: WISHLIST FUNCTIONS ---

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        // Populate 'wishlist' to get full product details
        const user = await User.findById(req.user._id).populate('wishlist');
        
        if (user) {
            res.json(user.wishlist);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        
        // $addToSet ensures no duplicates
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

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
    try {
        const productId = req.params.id;

        // $pull removes the item from the array
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
    getWishlist,
    addToWishlist,
    removeFromWishlist
};