const Product = require('../models/Product');
const Shop = require('../models/Shop');

// @desc    Fetch all products (with Search & Category Filter)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        // --- Search Logic ---
        // Agar query me 'keyword' hai (e.g. ?keyword=pen), toh name regex search karega
        const keyword = req.query.keyword
            ? {
                  name: {
                      $regex: req.query.keyword,
                      $options: 'i', // Case insensitive
                  },
              }
            : {};

        // --- Category Logic ---
        // Agar query me 'category' hai (e.g. ?category=Tech), toh filter add karo
        const category = req.query.category && req.query.category !== 'All' 
            ? { category: req.query.category } 
            : {};

        // Combine logic (Search Keyword AND Category)
        const products = await Product.find({ ...keyword, ...category }).populate('shop', 'name');

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
        // Reviews me user ka naam bhi chahiye, isliye reviews.user populate kiya
        const product = await Product.findById(req.params.id)
            .populate('shop', 'name logo owner') 
            .populate('reviews.user', 'name avatar');

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        // Agar ID format galat hai (CastError)
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Seller only)
const createProduct = async (req, res) => {
    try {
        // 1. Verify if user has a shop
        const shop = await Shop.findOne({ owner: req.user._id });
        if (!shop) {
            return res.status(400).json({ message: 'No shop found. You must register as a seller first.' });
        }

        const {
            name, price, description, image, category, 
            stock, tags, specs, colors, sizes,
            customizationAvailable, customizationType
        } = req.body;

        // 2. Create Product linked to Shop
        const product = new Product({
            shop: shop._id, // Link to seller's shop
            name,
            price,
            description,
            image,
            category,
            stock,
            tags, 
            specs,
            colors, 
            sizes,
            customizationAvailable, 
            customizationType,
            // Initial Ratings
            rating: 0,
            numReviews: 0
        });

        const createdProduct = await product.save();
        
        // --- SOCKET IO: Notify Shop Page Visitors ---
        // Agar koi user shop profile par hai, toh naya product list me turant add ho jayega
        if (req.io) {
            req.io.emit('product_created', {
                shopId: shop._id,
                product: {
                    _id: createdProduct._id,
                    name: createdProduct.name,
                    price: createdProduct.price,
                    image: createdProduct.image,
                    category: createdProduct.category
                }
            });
        }

        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Seller only)
const updateProduct = async (req, res) => {
    try {
        const {
            name, price, description, image, category,
            stock, tags, specs, colors, sizes,
            customizationAvailable, customizationType
        } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            // Check Ownership: Kya ye product usi shop ka hai jiska owner logged-in user hai?
            const shop = await Shop.findOne({ owner: req.user._id });
            
            if (!shop || product.shop.toString() !== shop._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to update this product' });
            }

            // Update fields
            product.name = name || product.name;
            product.price = price || product.price;
            product.description = description || product.description;
            product.image = image || product.image;
            product.category = category || product.category;
            product.stock = stock || product.stock;
            product.tags = tags || product.tags;
            product.specs = specs || product.specs;
            product.colors = colors || product.colors;
            product.sizes = sizes || product.sizes;
            // Use nullish coalescing (??) for booleans to allow 'false'
            product.customizationAvailable = customizationAvailable ?? product.customizationAvailable;
            product.customizationType = customizationType || product.customizationType;

            const updatedProduct = await product.save();

            // --- SOCKET IO: Live Update on Product Page ---
            // Price change, Stock Low, or Name change reflects instantly
            if (req.io) {
                req.io.emit('product_updated', {
                    _id: updatedProduct._id,
                    price: updatedProduct.price,
                    stock: updatedProduct.stock,
                    name: updatedProduct.name,
                    description: updatedProduct.description // Useful if someone is reading it
                });
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
            // Check Permission: Seller owns it OR User is Founder (Admin)
            const shop = await Shop.findOne({ owner: req.user._id });
            const isOwner = shop && product.shop.toString() === shop._id.toString();
            const isAdmin = req.user.role === 'founder';

            if (!isOwner && !isAdmin) {
                return res.status(401).json({ message: 'Not authorized to delete this product' });
            }

            await product.deleteOne();

            // --- SOCKET IO: Remove from Lists ---
            // Cart, Wishlist, or Browsing page se product gayab ho jana chahiye
            if (req.io) {
                req.io.emit('product_deleted', { 
                    _id: req.params.id,
                    shopId: product.shop 
                });
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
            // Check if user already reviewed
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

            // Calculate Average Rating
            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();

            // --- SOCKET IO: Live Review Feed ---
            // Product page par average stars aur naya review turant dikhega
            if (req.io) {
                req.io.emit('review_added', {
                    productId: product._id,
                    newRating: product.rating,
                    numReviews: product.numReviews,
                    review: {
                        name: req.user.name,
                        rating: Number(rating),
                        comment: comment,
                        createdAt: new Date()
                    }
                });
            }

            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get top rated products (For Carousel/Featured)
// @route   GET /api/products/top
// @access  Public
const getTopProducts = async (req, res) => {
    try {
        // Sort by rating descending, limit 3
        const products = await Product.find({}).sort({ rating: -1 }).limit(3);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get products by Shop ID (For Public Shop Profile)
// @route   GET /api/products/shop/:shopId
// @access  Public
const getProductsByShop = async (req, res) => {
    try {
        const products = await Product.find({ shop: req.params.shopId });
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