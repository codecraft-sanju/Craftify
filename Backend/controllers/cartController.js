// backend/controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get logged in user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'name price coverImage stock shippingCost')
            .populate('items.shop', 'name address');
        
        if (!cart) {
            return res.json({ items: [], totalPrice: 0 });
        }
        
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add item to cart (Smart Logic: Update Qty if exists)
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
    try {
        const { productId, qty, selectedSize, selectedColor, customization } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let itemImage = product.coverImage; 
        
        if (selectedColor && product.colors && product.colors.length > 0) {
            const matchedColor = product.colors.find(c => c.name === selectedColor);
            if (matchedColor && matchedColor.imageUrl) {
                itemImage = matchedColor.imageUrl;
            }
        }
   
        let cart = await Cart.findOne({ user: req.user._id });

        const newItem = {
            product: productId,
            name: product.name,
            image: itemImage, 
            price: product.price,
            qty: Number(qty) || 1,
            shippingCost: product.shippingCost || 0,
            selectedSize,
            selectedColor,
            customization,
            shop: product.shop
        };

        if (cart) {
            const itemIndex = cart.items.findIndex(item => {
                const isSameProduct = item.product.toString() === productId && 
                                      item.selectedSize === selectedSize &&
                                      item.selectedColor === selectedColor;

                const existingCust = item.customization || {};
                const newCust = customization || {};

                const isSameCustomization = existingCust.text === newCust.text &&
                                            existingCust.font === newCust.font &&
                                            existingCust.photoUrl === newCust.photoUrl;

                return isSameProduct && isSameCustomization;
            });

            if (itemIndex > -1) {
                cart.items[itemIndex].qty += newItem.qty;
            } else {
                cart.items.push(newItem);
            }
            await cart.save();
        } else {
            cart = await Cart.create({
                user: req.user._id,
                items: [newItem]
            });
        }

        // --- THE FIX: ALways return POPULATED cart after adding ---
        const populatedCart = await Cart.findById(cart._id)
            .populate('items.product', 'name price coverImage stock shippingCost')
            .populate('items.shop', 'name address');
            
        res.status(200).json(populatedCart);

    } catch (error) {
        console.error("Add to Cart Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/update
// @access  Private
const updateCartQuantity = async (req, res) => {
    try {
        const { itemId, action } = req.body; 
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = cart.items.find(item => item._id.toString() === itemId);
        if (!item) return res.status(404).json({ message: 'Item not found in cart' });

        if (action === 'inc') {
            item.qty += 1;
        } else if (action === 'dec') {
            if (item.qty > 1) {
                item.qty -= 1;
            } else {
                return res.status(400).json({ message: 'Quantity cannot be less than 1' });
            }
        }

        await cart.save();

        // --- THE FIX: Return POPULATED cart after updating quantity ---
        const populatedCart = await Cart.findById(cart._id)
            .populate('items.product', 'name price coverImage stock shippingCost')
            .populate('items.shop', 'name address');
            
        res.json(populatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (cart) {
            cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
            await cart.save();

            // --- THE FIX: Return POPULATED cart after removing item ---
            const populatedCart = await Cart.findById(cart._id)
                .populate('items.product', 'name price coverImage stock shippingCost')
                .populate('items.shop', 'name address');
                
            res.json(populatedCart);
        } else {
            res.status(404).json({ message: 'Cart not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
            res.json({ message: 'Cart cleared' });
        } else {
            res.status(404).json({ message: 'Cart not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart
};