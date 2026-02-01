// backend/controllers/productController.js
const Product = require('../models/Product');
const Shop = require('../models/Shop');

// @desc    Fetch all products (Marketplace View)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? {
                  name: {
                      $regex: req.query.keyword,
                      $options: 'i',
                  },
              }
            : {};

        const category = req.query.category && req.query.category !== 'All' 
            ? { category: req.query.category } 
            : {};

        // Populate shop details so we can show "Sold by [Shop Name]"
        const products = await Product.find({ ...keyword, ...category }).populate('shop', 'name logo rating');

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('shop', 'name logo owner rating') 
            .populate('reviews.user', 'name avatar');

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Seller only)
const createProduct = async (req, res) => {
    try {
        const {
            shop: shopId, // Frontend MUST send the Shop ID now
            name, price, description, category, 
            stock, tags, specs, colors, sizes,
            customizationAvailable, customizationType,
            image, coverImage, sku 
        } = req.body;

        // 1. Validation: Ensure Shop ID is provided
        if (!shopId) {
            return res.status(400).json({ message: 'Please specify which shop this product belongs to.' });
        }

        // 2. Security: Verify that the Logged-in User OWNS this specific shop
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found.' });
        }

        // Strict Check: Sirf Shop ka maalik hi product add kar sakta hai
        if (shop.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to add products to this shop.' });
        }

        // 3. SKU Logic (Auto-generate if empty to avoid E11000 error)
        // sparse: true in model handles nulls, but we generate one to be safe.
        const finalSku = sku && sku.trim() !== '' 
            ? sku 
            : `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // 4. Create Product
        const product = new Product({
            shop: shopId,
            name,
            price,
            description,
            coverImage: coverImage || image || 'https://via.placeholder.com/300',
            category,
            stock,
            tags, 
            specs,
            colors, 
            sizes,
            sku: finalSku, 
            customizationAvailable, 
            customizationType,
            rating: 0,
            numReviews: 0
        });

        const createdProduct = await product.save();
        
        // --- SOCKET IO: Notify Live Users ---
        if (req.io) {
            req.io.emit('product_created', {
                shopId: shop._id,
                productName: createdProduct.name
            });
        }

        res.status(201).json(createdProduct);

    } catch (error) {
        console.error("Create Product Error:", error);
        // Handle Duplicate Key (SKU or Slug)
        if (error.code === 11000) {
            return res.status(400).json({ message: "Duplicate error: Product name or SKU already exists." });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Seller only)
const updateProduct = async (req, res) => {
    try {
        const {
            name, price, description, category,
            stock, tags, specs, colors, sizes,
            customizationAvailable, customizationType,
            image, coverImage
        } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            // 1. Fetch the shop associated with this product
            const shop = await Shop.findById(product.shop);
            
            // 2. Strict Security Check: Does the logged-in user own this shop?
            if (!shop || shop.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this product' });
            }

            // 3. Update fields
            product.name = name || product.name;
            product.price = price || product.price;
            product.description = description || product.description;
            product.coverImage = coverImage || image || product.coverImage;
            product.category = category || product.category;
            product.stock = stock || product.stock;
            product.tags = tags || product.tags;
            product.specs = specs || product.specs;
            product.colors = colors || product.colors;
            product.sizes = sizes || product.sizes;
            product.customizationAvailable = customizationAvailable ?? product.customizationAvailable;
            product.customizationType = customizationType || product.customizationType;

            const updatedProduct = await product.save();

            // Socket Notification
            if (req.io) {
                req.io.emit('product_updated', { _id: updatedProduct._id });
            }

            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Seller or Admin)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            // Fetch Shop to check ownership
            const shop = await Shop.findById(product.shop);
            
            // Allow if Owner OR Founder (Admin)
            const isOwner = shop && shop.owner.toString() === req.user._id.toString();
            const isAdmin = req.user.role === 'founder';

            if (!isOwner && !isAdmin) {
                return res.status(403).json({ message: 'Not authorized to delete this product' });
            }

            await product.deleteOne();

            if (req.io) {
                req.io.emit('product_deleted', { _id: req.params.id, shopId: product.shop });
            }

            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private (Customer)
const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Product already reviewed' });
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
            };

            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();

            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ rating: -1 }).limit(3);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get products by Shop ID (For Public Storefront)
// @route   GET /api/products/shop/:shopId
// @access  Public
const getProductsByShop = async (req, res) => {
    try {
        const products = await Product.find({ shop: req.params.shopId }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getTopProducts,
    getProductsByShop
};