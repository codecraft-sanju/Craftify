const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// --- Utility: Generate JWT Token ---
// Yeh token frontend ko milega taaki wo protected routes access kar sake
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token 30 din tak valid rahega
    });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Validation: Check if fields are empty
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // 2. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. Create User
        // Note: Password hashing Model ke 'pre-save' hook me handle ho raha hai automatically
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'customer', // Default to customer if not provided
            avatar: name.charAt(0).toUpperCase() // Initials as avatar (e.g., 'S' for Sanjay)
        });

        if (user) {
            // --- SOCKET IO: Notify Admin of New Registration ---
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
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // User find karo email se
        // MODIFIED: Added .select('+password') because select: false is set in the model
        const user = await User.findOne({ email }).select('+password');

        // Password check karo (Method defined in User model)
        if (user && (await user.matchPassword(password))) {
            
            // --- SOCKET IO: User Came Online ---
            if (req.io) {
                req.io.emit('user_login', { 
                    userId: user._id, 
                    name: user.name,
                    role: user.role 
                });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                shop: user.shop, // Agar seller hai toh shop ID bhi bhejo
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile (Current User)
// @route   GET /api/users/profile
// @access  Private (Needs Token)
const getUserProfile = async (req, res) => {
    try {
        // req.user humare middleware se aayega (jo hum next step me banayenge)
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
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
            
            // Password change sirf tab kare jab user naya password bheje
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            // --- SOCKET IO: Notify Active Sessions of Update ---
            if (req.io) {
                req.io.emit('user_updated', {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email
                });
            }

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- ADMIN / FOUNDER FUNCTIONS ---

// @desc    Get all users (For Founder Dashboard)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();

            // --- SOCKET IO: Notify Admin Dashboard to Remove Row ---
            if (req.io) {
                req.io.emit('user_deleted', { _id: req.params.id });
            }

            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
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

// @desc    Update user (Admin functionality - e.g., promoting to Seller)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role; // Founder can change roles

            const updatedUser = await user.save();

            // --- SOCKET IO: Notify Specific User of Role Change ---
            // Useful to auto-refresh their dashboard permissions without logout
            if (req.io) {
                req.io.emit('admin_updated_user', {
                    _id: updatedUser._id,
                    role: updatedUser.role,
                    message: 'Your account permissions have been updated.'
                });
            }

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

module.exports = {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
};