// backend/controllers/shopController.js
const Shop = require('../models/Shop');
const User = require('../models/User');

// @desc    Register a new Shop (Multi-Shop Allowed)
// @route   POST /api/shops
// @access  Private (Registered User)
const registerShop = async (req, res) => {
    try {
        // --- CHANGE: Added paymentQrCode to destructuring ---
        const { name, tagline, description, phone, logo, paymentQrCode } = req.body;

        // 1. Create the Shop directly (No "Already Exists" check)
        const shop = await Shop.create({
            owner: req.user._id,
            name,
            tagline,
            description,
            phone,
            logo: logo || undefined, 
            // Save Seller QR Code if provided
            paymentQrCode: paymentQrCode || '', 
            isActive: true 
        });

        // 2. Update User Role
        // Agar user pehle se seller nahi tha, toh ab seller ban jayega
        const user = await User.findById(req.user._id);
        if (user.role === 'customer') {
            user.role = 'seller';
            await user.save();
        }

        // --- SOCKET IO: Notify Admin ---
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
        console.error("Register Shop Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Shops owned by Current Seller
// @route   GET /api/shops/my-shop
// @access  Private (Seller)
const getMyShops = async (req, res) => {
    try {
        // Find ALL shops where owner is the logged-in user
        const shops = await Shop.find({ owner: req.user._id });

        // Frontend compatibility: Return first shop or null
        const primaryShop = shops.length > 0 ? shops[0] : null;

        if (primaryShop) {
            res.json(primaryShop);
        } else {
            res.json(null); 
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Shop by ID (Public View)
// @route   GET /api/shops/:id
// @access  Public
const getShopById = async (req, res) => {
    try {
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

// @desc    Update Shop Settings
// @route   PUT /api/shops/my-shop
// @access  Private (Seller)
const updateShopProfile = async (req, res) => {
    try {
        // Updating the first shop found for now
        const shop = await Shop.findOne({ owner: req.user._id });

        if (shop) {
            shop.name = req.body.name || shop.name;
            shop.tagline = req.body.tagline || shop.tagline;
            shop.description = req.body.description || shop.description;
            shop.phone = req.body.phone || shop.phone;
            shop.logo = req.body.logo || shop.logo;

            // --- CHANGE: Update Seller QR Code ---
            // This is critical for the Founder to pay the Seller
            if (req.body.paymentQrCode) {
                shop.paymentQrCode = req.body.paymentQrCode;
            }
            // -------------------------------------

            const updatedShop = await shop.save();

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

// @desc    Get All Shops
// @route   GET /api/shops
// @access  Private (Admin/Founder)
const getAllShops = async (req, res) => {
    try {
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

// @desc    Update Shop Status
// @route   PUT /api/shops/:id/status
// @access  Private (Admin/Founder)
const updateShopStatus = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);

        if (shop) {
            shop.isActive = req.body.isActive;
            const updatedShop = await shop.save();

            if (req.io) {
                req.io.emit('shop_status_changed', {
                    shopId: updatedShop._id,
                    ownerId: updatedShop.owner,
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
    getMyShop: getMyShops,
    getShopById,
    updateShopProfile,
    getAllShops,
    deleteShop,
    updateShopStatus
};