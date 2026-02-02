// backend/controllers/orderController.js
const Order = require('../models/Order');
const Shop = require('../models/Shop');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
const addOrderItems = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // --- NEW VALIDATION: Check Address & Phone ---
        // Agar frontend se address ya phone nahi aaya, toh yahi rok denge
        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.phone) {
            return res.status(400).json({ message: 'Please provide complete shipping address and phone number.' });
        }
        // ---------------------------------------------

        // 1. Create the Order
        const order = new Order({
            customer: req.user._id,
            items: orderItems, // Frontend sends shopId inside each item
            shippingAddress,   // Ab isme phone number bhi included hoga
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalAmount: totalPrice,
        });

        const createdOrder = await order.save();

        // 2. STOCK MANAGEMENT & REAL-TIME ALERTS
        
        // List of all unique shops involved in this order
        const involvedShops = [...new Set(orderItems.map(item => item.shop))];

        // Loop through items to update stock
        for (const item of orderItems) {
            // --- ATOMIC UPDATE: Safe & Fast ---
            const updatedProduct = await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.qty } }, // Reduce stock
                { new: true } 
            );

            if (updatedProduct) {
                // --- SOCKET IO: Live Stock Update for other customers ---
                if (req.io) {
                    req.io.emit('product_updated', {
                        _id: updatedProduct._id,
                        stock: updatedProduct.stock
                    });
                }
            }
        }

        // --- SOCKET IO: Notify Sellers ---
        // Sellers frontend will listen: "Is this order ID for one of my shops?"
        if (req.io) {
            req.io.emit('new_order_placed', {
                orderId: createdOrder._id,
                shopIds: involvedShops, 
                totalAmount: createdOrder.totalAmount,
                customerName: req.user.name
            });
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email')
            .populate('items.product', 'name coverImage'); // Populate product details

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address,
            };

            const updatedOrder = await order.save();

            // Notify involved sellers
            const involvedShops = [...new Set(order.items.map(item => item.shop.toString()))];
            
            if (req.io) {
                req.io.emit('order_paid', {
                    orderId: updatedOrder._id,
                    shopIds: involvedShops,
                    status: 'Paid'
                });
            }

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status (Processing -> Shipped -> Delivered)
// @route   PUT /api/orders/:id/deliver
// @access  Private (Seller/Admin)
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            // Note: In a strict multi-vendor system, we would update individual item statuses.
            // For this MVP, updating the global status is acceptable.
            
            order.orderStatus = req.body.status; 
            
            if (req.body.status === 'Delivered') {
                order.deliveredAt = Date.now();
            } else if (req.body.status === 'Shipped') {
                order.shippedAt = Date.now();
            }

            const updatedOrder = await order.save();

            // Notify Customer
            if (req.io) {
                req.io.emit('order_status_updated', {
                    orderId: updatedOrder._id,
                    customerId: updatedOrder.customer, 
                    status: updatedOrder.orderStatus
                });
            }

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user orders (My Orders)
// @route   GET /api/orders/myorders
// @access  Private (Customer)
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- SELLER & ADMIN FEATURES ---

// @desc    Get Seller's Shop Orders (MULTI-SHOP FIXED)
// @route   GET /api/orders/shop-orders
// @access  Private (Seller)
const getShopOrders = async (req, res) => {
    try {
        // 1. User ki SAARI shops dhundo (Array of shops)
        const shops = await Shop.find({ owner: req.user._id });
        
        if (!shops || shops.length === 0) {
            return res.status(404).json({ message: 'No shops found for this seller' });
        }

        // 2. Un sabhi shops ki IDs ka array banao
        const shopIds = shops.map(shop => shop._id);

        // 3. Database mein wo orders dhundo jisme inme se KOI BHI shop involved ho
        // $in operator checks if 'items.shop' matches ANY id in 'shopIds' array
        const orders = await Order.find({ 'items.shop': { $in: shopIds } })
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });

        // Note: Frontend will receive full orders. 
        // Logic to calculate specific revenue for *this* seller needs to happen on frontend
        // by filtering items inside the order that match the seller's shop IDs.
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders (Founder Dashboard)
// @route   GET /api/orders
// @access  Private (Admin/Founder)
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('customer', 'id name')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderStatus,
    getMyOrders,
    getShopOrders,
    getOrders,     
};