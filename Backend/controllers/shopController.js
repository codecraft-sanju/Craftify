const Shop = require('../models/Shop');
const User = require('../models/User');

// @desc    Register a new Shop
// @route   POST /api/shops
// @access  Private (Registered User)
const registerShop = async (req, res) => {
    try {
        const { name, tagline, description, phone, logo } = req.body;

        // 1. Check agar user ke paas pehle se shop hai (One shop per user policy)
        const shopExists = await Shop.findOne({ owner: req.user._id });

        if (shopExists) {
            return res.status(400).json({ message: 'You already own a shop' });
        }

        // 2. Create the Shop
        const shop = await Shop.create({
            owner: req.user._id,
            name,
            tagline,
            description,
            phone,
            logo: logo || undefined, // Agar logo nahi bheja toh default use hoga model se
            isActive: true 
        });

        // 3. IMPORTANT: Update the User Model
        // User ka role 'seller' banate hain aur shop ID user me save karte hain
        const user = await User.findById(req.user._id);
        user.role = 'seller';
        user.shop = shop._id;
        await user.save();

        // --- SOCKET IO: Notify Admin of New Shop ---
        if (req.io) {
            req.io.emit('shop_created', {
                _id: shop._id,
                name: shop.name,
                ownerName: user.name,
                createdAt: shop.createdAt
            });
        }

        res.status(201).json(shop);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Current Seller's Shop Profile (For StoreAdmin.jsx)
// @route   GET /api/shops/my-shop
// @access  Private (Seller)
const getMyShop = async (req, res) => {
    try {
        // Logged in user ki ID se shop dhundo
        const shop = await Shop.findOne({ owner: req.user._id });

        if (shop) {
            res.json(shop);
        } else {
            res.status(404).json({ message: 'Shop not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Shop by ID (For Public ShopView.jsx)
// @route   GET /api/shops/:id
// @access  Public
const getShopById = async (req, res) => {
    try {
        // Owner ka naam aur email bhi populate karte hain taaki frontend pe dikha sake "Sold by Sanjay"
        const shop = await Shop.findById(req.params.id).populate('owner', 'name email avatar');

        if (shop) {
            res.json(shop);
        } else {
            res.status(404).json({ message: 'Shop not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Shop Settings (Name, Tagline, Phone, etc.)
// @route   PUT /api/shops/my-shop
// @access  Private (Seller)
const updateShopProfile = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.user._id });

        if (shop) {
            // Frontend se data aa raha hai, usse update karo
            shop.name = req.body.name || shop.name;
            shop.tagline = req.body.tagline || shop.tagline;
            shop.description = req.body.description || shop.description;
            shop.phone = req.body.phone || shop.phone;
            shop.logo = req.body.logo || shop.logo;

            const updatedShop = await shop.save();

            // --- SOCKET IO: Real-time Update for Customers Viewing Shop ---
            // Jo log abhi iss shop ko dekh rahe hain, unhe turant naya naam/logo dikhega
            if (req.io) {
                req.io.emit('shop_updated', {
                    shopId: updatedShop._id,
                    name: updatedShop.name,
                    logo: updatedShop.logo,
                    tagline: updatedShop.tagline
                });
            }

            res.json(updatedShop);
        } else {
            res.status(404).json({ message: 'Shop not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- FOUNDER / ADMIN FEATURES ---

// @desc    Get All Shops (For Founder Dashboard)
// @route   GET /api/shops
// @access  Private (Admin/Founder)
const getAllShops = async (req, res) => {
    try {
        // Owner details populate kar rahe hain taaki Founder dashboard table me "Owner Name" dikhe
        const shops = await Shop.find({}).populate('owner', 'name email avatar');
        res.json(shops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Shop
// @route   DELETE /api/shops/:id
// @access  Private (Admin/Founder)
const deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);

        if (shop) {
            await shop.deleteOne();
            
            // Optional: User ka role wapas 'customer' kar sakte hain
            const user = await User.findById(shop.owner);
            if (user) {
                user.role = 'customer';
                user.shop = undefined;
                await user.save();
            }

            // --- SOCKET IO: Notify Dashboard & Owner ---
            if (req.io) {
                req.io.emit('shop_deleted', { shopId: req.params.id });
            }

            res.json({ message: 'Shop removed' });
        } else {
            res.status(404).json({ message: 'Shop not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Shop Status (Ban/Unban functionality)
// @route   PUT /api/shops/:id/status
// @access  Private (Admin/Founder)
const updateShopStatus = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);

        if (shop) {
            shop.isActive = req.body.isActive;
            const updatedShop = await shop.save();

            // --- SOCKET IO: Notify Seller Immediately ---
            // Agar shop ban ho gayi, toh seller ke dashboard pe turant alert aayega
            if (req.io) {
                req.io.emit('shop_status_changed', {
                    shopId: updatedShop._id,
                    ownerId: updatedShop.owner, // Frontend will check if this matches logged-in user
                    isActive: updatedShop.isActive,
                    message: updatedShop.isActive ? 'Your shop is now Active!' : 'Your shop has been suspended.'
                });
            }

            res.json(updatedShop);
        } else {
            res.status(404).json({ message: 'Shop not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerShop,
    getMyShop,
    getShopById,
    updateShopProfile,
    getAllShops,
    deleteShop,
    updateShopStatus
};