const Product = require('../models/Product');
const Shop = require('../models/Shop');

// ProductController.js -> getProducts

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

        // --- THE BULLETPROOF FIX FOR 2-WORD CATEGORIES ---
        // Yahan exact match ki jagah flexible regex lagaya hai 
        // Jo aage-peeche ke extra spaces ko ignore kar dega aur 'Wooden frame' dhund lega
        const category = req.query.category && req.query.category !== 'All' 
            ? { category: { $regex: req.query.category.trim(), $options: 'i' } } 
            : {};

        const queryFilter = { ...keyword, ...category };

        const count = await Product.countDocuments(queryFilter);

        const products = await Product.find(queryFilter)
            .populate('shop', 'name logo rating')
            .sort({ createdAt: -1 });
        
        res.json({
            products,
            page: 1,
            pages: 1,
            hasMore: false 
        });

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
// @access  Private (Seller, Founder, Admin)
const createProduct = async (req, res) => {
    try {
        let {
            shop: shopId, 
            name, price, description, category, 
            stock, tags, specs, colors, sizes,
            customizationAvailable, customizationType,
            image, coverImage, sku,
            images, 
            compareAtPrice,
            // --- CHANGES MADE HERE: Extract shippingCost ---
            shippingCost 
        } = req.body;

        if (category) {
            category = category.trim().toLowerCase();
        }

        // 1. Validation: Ensure Shop ID is provided
        if (!shopId) {
            return res.status(400).json({ message: 'Please specify which shop this product belongs to.' });
        }

        // 2. Security: Verify that the Logged-in User OWNS this specific shop OR is Founder/Admin
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found.' });
        }

        const isOwner = shop.owner.toString() === req.user._id.toString();
        const isFounderOrAdmin = req.user.role === 'founder' || req.user.role === 'admin';

        if (!isOwner && !isFounderOrAdmin) {
            return res.status(403).json({ message: 'You are not authorized to add products to this shop.' });
        }

        if (category && !shop.categories.includes(category)) {
            shop.categories.push(category);
            await shop.save();
        }

        if (images && images.length > 4) {
            return res.status(400).json({ message: 'You can upload a maximum of 4 images only.' });
        }

        let finalCoverImage = coverImage;
        if (!finalCoverImage && images && images.length > 0) {
            finalCoverImage = images[0].url;
        } else if (!finalCoverImage) {
            finalCoverImage = image || 'https://via.placeholder.com/300';
        }

        // 3. SKU Logic (Auto-generate if empty to avoid E11000 error)
        const finalSku = sku && sku.trim() !== '' 
            ? sku 
            : `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // 4. Create Product
        const product = new Product({
            shop: shopId,
            name,
            price,
            compareAtPrice: compareAtPrice || 0,
            // --- CHANGES MADE HERE: Save shippingCost ---
            shippingCost: shippingCost || 0,
            description,
            coverImage: finalCoverImage,
            images: images || [], 
            category,
            stock,
            tags, 
            specs,
            colors: colors || [],
            sizes,
            sku: finalSku, 
            customizationAvailable, 
            customizationType,
            rating: 0,
            numReviews: 0
        });

        const createdProduct = await product.save();
        
        // Socket Notification
        if (req.io) {
            req.io.emit('product_created', {
                shopId: shop._id,
                productName: createdProduct.name
            });
        }

        res.status(201).json(createdProduct);

    } catch (error) {
        console.error("Create Product Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "Duplicate error: Product name or SKU already exists." });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Seller, Founder, Admin)
const updateProduct = async (req, res) => {
    try {
        let {
            name, price, description, category,
            stock, tags, specs, colors, sizes,
            customizationAvailable, customizationType,
            image, coverImage,
            images, 
            compareAtPrice,
            shippingCost 
        } = req.body;

        if (category) {
            category = category.trim().toLowerCase();
        }

        const product = await Product.findById(req.params.id);

        if (product) {
            const shop = await Shop.findById(product.shop);
            
            const isOwner = shop && shop.owner.toString() === req.user._id.toString();
            const isFounderOrAdmin = req.user.role === 'founder' || req.user.role === 'admin';

            if (!isOwner && !isFounderOrAdmin) {
                return res.status(403).json({ message: 'Not authorized to update this product' });
            }

            if (category && !shop.categories.includes(category)) {
                shop.categories.push(category);
                await shop.save();
            }

            if (images && images.length > 4) {
                return res.status(400).json({ message: 'You can upload a maximum of 4 images only.' });
            }

            product.name = name || product.name;
            product.price = price || product.price;
            
            if (compareAtPrice !== undefined) {
                product.compareAtPrice = compareAtPrice;
            }

            // --- CHANGES MADE HERE: Update shippingCost ---
            if (shippingCost !== undefined) {
                product.shippingCost = shippingCost;
            }

            product.description = description || product.description;
            
            if (images) {
                product.images = images;
            }
            
            if (coverImage) {
                product.coverImage = coverImage;
            } else if (image) {
                product.coverImage = image;
            } else if (images && images.length > 0 && !product.coverImage) {
                product.coverImage = images[0].url;
            }

            product.category = category || product.category;
            product.stock = stock || product.stock;
            product.tags = tags || product.tags;
            product.specs = specs || product.specs;
            
            if (colors) {
                product.colors = colors;
            }

            product.sizes = sizes || product.sizes;
            product.customizationAvailable = customizationAvailable ?? product.customizationAvailable;
            
            product.customizationType = customizationType || product.customizationType;

            const updatedProduct = await product.save();

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
// @access  Private (Seller or Founder/Admin)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            const shop = await Shop.findById(product.shop);
            
            const isOwner = shop && shop.owner.toString() === req.user._id.toString();
            const isFounderOrAdmin = req.user.role === 'founder' || req.user.role === 'admin';

            if (!isOwner && !isFounderOrAdmin) {
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
        // --- CHANGES MADE HERE: Added image to destructuring ---
        const { rating, comment, image } = req.body;
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
                // --- CHANGES MADE HERE: Saved image in the review object ---
                image: image || null,
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

// @desc    Delete multiple products by IDs (Smart Chunk Deletion)
// @route   DELETE /api/products/batch
// @access  Private (Founder, Admin or Seller Owner)
const deleteProductsBatch = async (req, res) => {
    try {
        const { productIds } = req.body; 

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ message: 'No product IDs provided' });
        }

        const products = await Product.find({ _id: { $in: productIds } });

        if (products.length === 0) {
            return res.status(404).json({ message: 'No matching products found' });
        }

        const isFounderOrAdmin = req.user.role === 'founder' || req.user.role === 'admin';
        
        if (!isFounderOrAdmin) {
            const firstProduct = products[0];
            const shop = await Shop.findById(firstProduct.shop);

            if (!shop || shop.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized. You can only delete your own products.' });
            }
        }

        const result = await Product.deleteMany({ _id: { $in: productIds } });

        if (req.io) {
            req.io.emit('products_batch_deleted', { 
                productIds,
                count: result.deletedCount 
            });
        }

        res.json({ 
            success: true, 
            message: `Deleted ${result.deletedCount} products successfully` 
        });

    } catch (error) {
        console.error("Batch Delete Error:", error);
        res.status(500).json({ message: error.message });
    }
};

const getRelatedProducts = async (req, res) => {
    try {
        const currentProductId = req.params.id;

        const currentProduct = await Product.findById(currentProductId);
        
        if (!currentProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const sameCategoryProducts = await Product.aggregate([
            { 
                $match: { 
                    category: currentProduct.category, 
                    _id: { $ne: currentProduct._id } 
                } 
            },
            { $sample: { size: 6 } }
        ]);

        const populatedSameCategory = await Product.populate(sameCategoryProducts, { 
            path: 'shop', 
            select: 'name logo rating' 
        });

        const remainingLimit = 16 - populatedSameCategory.length;

        const otherCategoryProducts = await Product.aggregate([
            { 
                $match: { 
                    category: { $ne: currentProduct.category }, 
                    _id: { $ne: currentProduct._id } 
                } 
            },
            { $sample: { size: remainingLimit } }
        ]);

        const populatedOtherCategory = await Product.populate(otherCategoryProducts, { 
            path: 'shop', 
            select: 'name logo rating' 
        });

        let finalRecommendations = [...populatedSameCategory, ...populatedOtherCategory];

        res.json(finalRecommendations);

    } catch (error) {
        console.error("Related Products Error:", error);
        res.status(500).json({ message: "Server Error fetching related products" });
    }
};

// @desc    Increment view count for a product
// @route   PUT /api/products/:id/view
// @access  Public
const incrementProductView = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'View updated successfully', views: product.views });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating view count' });
    }
};

// @desc    Get top 20 trending products based on views
// @route   GET /api/products/trending
// @access  Public
const getTrendingProducts = async (req, res) => {
    try {
        const trendingProducts = await Product.find({ stock: { $gt: 0 } })
            .sort({ views: -1 })
            .limit(20)
            .populate('shop', 'name logo rating');

        res.json(trendingProducts);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching trending products' });
    }
};

// @desc    Get all distinct categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        res.json(categories);
    } catch (error) {
        console.error("Get Categories Error:", error);
        res.status(500).json({ message: "Server Error fetching categories" });
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
    getProductsByShop,
    deleteProductsBatch,
    getRelatedProducts,
    incrementProductView,   
    getTrendingProducts,    
    getCategories 
};