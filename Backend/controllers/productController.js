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

        // Fetch products as usual
        let products = await Product.find({ ...keyword, ...category }).populate('shop', 'name logo rating');

        // --- NEW LOGIC: Shuffle (Randomize) the products array before sending ---
        // Fisher-Yates algorithm
        for (let i = products.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [products[i], products[j]] = [products[j], products[i]];
        }

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
// @access  Private (Seller, Founder, Admin)
const createProduct = async (req, res) => {
    try {
        // --- CHANGES MADE HERE: Changed const to let so we can modify category ---
        let {
            shop: shopId, 
            name, price, description, category, 
            stock, tags, specs, colors, sizes,
            customizationAvailable, customizationType,
            image, coverImage, sku,
            images, // --- NEW: Array of images ---
            compareAtPrice // CHANGES MADE: Extracted compareAtPrice
        } = req.body;

        // --- CHANGES MADE HERE: Clean the category string to prevent duplicates ---
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

        // --- CHANGES MADE HERE: Strict Check allowing Founder/Admin too ---
        const isOwner = shop.owner.toString() === req.user._id.toString();
        const isFounderOrAdmin = req.user.role === 'founder' || req.user.role === 'admin';

        if (!isOwner && !isFounderOrAdmin) {
            return res.status(403).json({ message: 'You are not authorized to add products to this shop.' });
        }

        // --- NEW LOGIC: Auto-Add Category to Shop if it's new ---
        if (category && !shop.categories.includes(category)) {
            shop.categories.push(category);
            await shop.save();
        }
        // --------------------------------------------------------

        // --- NEW: Max 4 Images Validation ---
        if (images && images.length > 4) {
            return res.status(400).json({ message: 'You can upload a maximum of 4 images only.' });
        }

        // --- NEW: Smart Cover Image Logic ---
        // Agar coverImage nahi di, toh pehli uploaded image ko cover bana do
        let finalCoverImage = coverImage;
        if (!finalCoverImage && images && images.length > 0) {
            finalCoverImage = images[0].url;
        } else if (!finalCoverImage) {
            // Fallback for backward compatibility
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
            compareAtPrice: compareAtPrice || 0, // CHANGES MADE: Added to model
            description,
            coverImage: finalCoverImage,
            images: images || [], // --- NEW: Saving images array ---
            category,
            stock,
            tags, 
            specs,
            colors: colors || [], // CHANGES MADE: Now accepts array of objects (name, hexCode, imageUrl)
            sizes,
            sku: finalSku, 
            customizationAvailable, 
            // --- CHANGES MADE HERE: This will now naturally accept 'both' along with other types from frontend ---
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
// @access  Private (Seller, Founder, Admin)
const updateProduct = async (req, res) => {
    try {
        // --- CHANGES MADE HERE: Changed const to let so we can modify category ---
        let {
            name, price, description, category,
            stock, tags, specs, colors, sizes,
            customizationAvailable, customizationType,
            image, coverImage,
            images, // --- NEW: Handle images update ---
            compareAtPrice // CHANGES MADE: Extracted compareAtPrice
        } = req.body;

        // --- CHANGES MADE HERE: Clean the category string to prevent duplicates ---
        if (category) {
            category = category.trim().toLowerCase();
        }

        const product = await Product.findById(req.params.id);

        if (product) {
            // 1. Fetch the shop associated with this product
            const shop = await Shop.findById(product.shop);
            
            // --- CHANGES MADE HERE: Strict Security Check allowing Founder/Admin too ---
            const isOwner = shop && shop.owner.toString() === req.user._id.toString();
            const isFounderOrAdmin = req.user.role === 'founder' || req.user.role === 'admin';

            if (!isOwner && !isFounderOrAdmin) {
                return res.status(403).json({ message: 'Not authorized to update this product' });
            }

            // --- NEW LOGIC: Auto-Add Category to Shop if it's new ---
            if (category && !shop.categories.includes(category)) {
                shop.categories.push(category);
                await shop.save();
            }
            // --------------------------------------------------------

            // --- NEW: Max 4 Images Validation ---
            if (images && images.length > 4) {
                return res.status(400).json({ message: 'You can upload a maximum of 4 images only.' });
            }

            // 3. Update fields
            product.name = name || product.name;
            product.price = price || product.price;
            
            // CHANGES MADE: Update compareAtPrice gracefully
            if (compareAtPrice !== undefined) {
                product.compareAtPrice = compareAtPrice;
            }

            product.description = description || product.description;
            
            // --- NEW: Update Images Logic ---
            if (images) {
                product.images = images;
            }
            
            // --- NEW: Update Cover Image Logic ---
            if (coverImage) {
                product.coverImage = coverImage;
            } else if (image) {
                product.coverImage = image;
            } else if (images && images.length > 0 && !product.coverImage) {
                // If cover image is missing but we have new images, use the first one
                product.coverImage = images[0].url;
            }

            product.category = category || product.category;
            product.stock = stock || product.stock;
            product.tags = tags || product.tags;
            product.specs = specs || product.specs;
            
            // CHANGES MADE: Update colors handling to accept array of objects
            if (colors) {
                product.colors = colors;
            }

            product.sizes = sizes || product.sizes;
            product.customizationAvailable = customizationAvailable ?? product.customizationAvailable;
            
            // --- CHANGES MADE HERE: Ensures updated customization type ('both', 'upload', etc.) is saved ---
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
// @access  Private (Seller or Founder/Admin)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            // Fetch Shop to check ownership
            const shop = await Shop.findById(product.shop);
            
            // --- CHANGES MADE HERE: Allow if Owner OR Founder/Admin ---
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

// --- NEW FEATURE: BATCH DELETE ---
// @desc    Delete multiple products by IDs (Smart Chunk Deletion)
// @route   DELETE /api/products/batch
// @access  Private (Founder, Admin or Seller Owner)
const deleteProductsBatch = async (req, res) => {
    try {
        const { productIds } = req.body; // Array of IDs

        // 1. Validation
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ message: 'No product IDs provided' });
        }

        // 2. Fetch Products to Check Ownership
        const products = await Product.find({ _id: { $in: productIds } });

        if (products.length === 0) {
            return res.status(404).json({ message: 'No matching products found' });
        }

        // 3. Security Check
        // --- CHANGES MADE HERE: Added Admin check alongside Founder ---
        const isFounderOrAdmin = req.user.role === 'founder' || req.user.role === 'admin';
        
        // Agar user Founder/Admin nahi hai, toh check karo kya yeh products user ki shop ke hain?
        if (!isFounderOrAdmin) {
            // (Hum pehle product se shop ID check kar rahe hain, assuming batch same shop ka hai)
            const firstProduct = products[0];
            const shop = await Shop.findById(firstProduct.shop);

            if (!shop || shop.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized. You can only delete your own products.' });
            }
        }

        // 4. (Optional) Cloudinary Image Cleanup code yahan aa sakta hai

        // 5. Delete from Database
        const result = await Product.deleteMany({ _id: { $in: productIds } });

        // 6. Socket Notification
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

        // 1. Current product find karo taki uski category pata chal sake
        const currentProduct = await Product.findById(currentProductId);
        
        if (!currentProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // 2. Same category ke max 6 random products nikal lo (current ko chhodkar)
        const sameCategoryProducts = await Product.aggregate([
            { 
                $match: { 
                    category: currentProduct.category, 
                    _id: { $ne: currentProduct._id } 
                } 
            },
            { $sample: { size: 6 } }
        ]);

        // Same category walo ko populate karo
        const populatedSameCategory = await Product.populate(sameCategoryProducts, { 
            path: 'shop', 
            select: 'name logo rating' 
        });

        // 3. Calculate karo kitne random products aur chahiye 16 ka total pura karne ke liye
        const remainingLimit = 16 - populatedSameCategory.length;

        // 4. Baki bache hue random products dusri categories se uthao
        const otherCategoryProducts = await Product.aggregate([
            { 
                $match: { 
                    category: { $ne: currentProduct.category }, 
                    _id: { $ne: currentProduct._id } 
                } 
            },
            { $sample: { size: remainingLimit } }
        ]);

        // Dusri category walo ko populate karo
        const populatedOtherCategory = await Product.populate(otherCategoryProducts, { 
            path: 'shop', 
            select: 'name logo rating' 
        });

        // 5. Dono arrays ko merge kar do
        let finalRecommendations = [...populatedSameCategory, ...populatedOtherCategory];

        // --- OPTIONAL: Shuffle the final array ---
        // Agar aap chahte ho ki 6 category wale aur 10 random wale mix hokar dikhein, 
        // to is block ko uncomment kar do. Nahi to pehle 6 category wale aayenge, fir baki.
        /*
        for (let i = finalRecommendations.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [finalRecommendations[i], finalRecommendations[j]] = [finalRecommendations[j], finalRecommendations[i]];
        }
        */

        res.json(finalRecommendations);

    } catch (error) {
        console.error("Related Products Error:", error);
        res.status(500).json({ message: "Server Error fetching related products" });
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
    getRelatedProducts
};