// backend/controllers/shopController.js
const Shop = require('../models/Shop');
const User = require('../models/User');

// @desc    Register a new Shop (Multi-Shop Allowed)
// @route   POST /api/shops
// @access  Private (Registered User)
const registerShop = async (req, res) => {
    try {
        const { name, tagline, description, phone, logo } = req.body;

        // 1. Create the Shop directly (No "Already Exists" check)
        const shop = await Shop.create({
            owner: req.user._id,
            name,
            tagline,
            description,
            phone,
            logo: logo || undefined, 
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
        // Returns an array: [{shop1}, {shop2}]
        const shops = await Shop.find({ owner: req.user._id });

        // Frontend expects either null (no shop) or data
        // If array is empty, return null or empty array based on your frontend logic
        // For your current frontend which expects a single object initially:
        // We will return the FIRST shop found for now to keep frontend working,
        // but ideally frontend should handle an array.
        
        // TEMPORARY FIX FOR FRONTEND COMPATIBILITY:
        // Return the first shop if exists, else null.
        // (Later we can update frontend to show a list of shops)
        const primaryShop = shops.length > 0 ? shops[0] : null;

        if (primaryShop) {
            res.json(primaryShop);
        } else {
            // Send null so frontend shows "Create Shop" form
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
        // For now, updating the first shop found. 
        // In future, pass shopId in params to update specific shop.
        const shop = await Shop.findOne({ owner: req.user._id });

        if (shop) {
            shop.name = req.body.name || shop.name;
            shop.tagline = req.body.tagline || shop.tagline;
            shop.description = req.body.description || shop.description;
            shop.phone = req.body.phone || shop.phone;
            shop.logo = req.body.logo || shop.logo;

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
            
            // Note: Not downgrading user role automatically, 
            // as they might have other shops.
            
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