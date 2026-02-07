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
            paymentInfo, 
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // --- VALIDATION: Check Address & Phone ---
        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.phone) {
            return res.status(400).json({ message: 'Please provide complete shipping address and phone number.' });
        }

        // --- VALIDATION Payment Info ---
        if (!paymentInfo || !paymentInfo.method) {
            return res.status(400).json({ message: 'Payment method is required' });
        }
        
        // If Online payment, Transaction ID is mandatory
        if (paymentInfo.method === 'Online' && !paymentInfo.transactionId) {
            return res.status(400).json({ message: 'Transaction ID is required for Online payments' });
        }

        // 1. Create the Order
        const order = new Order({
            customer: req.user._id,
            items: orderItems, 
            shippingAddress,   
            paymentInfo: {
                method: paymentInfo.method,
                transactionId: paymentInfo.transactionId || null,
                status: paymentInfo.method === 'Online' ? 'Pending' : 'Pending' 
            },
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalAmount: totalPrice,
        });

        const createdOrder = await order.save();

        // 2. STOCK MANAGEMENT & REAL-TIME ALERTS
        const involvedShops = [...new Set(orderItems.map(item => item.shop))];

        for (const item of orderItems) {
            const updatedProduct = await Product.findByIdAndUpdate(
                item.product,
               // Stock ghatao (-) aur Sold badhao (+)
{ $inc: { stock: -item.qty, sold: item.qty } },
                { new: true } 
            );

            if (updatedProduct) {
                // --- SOCKET IO: Live Stock Update ---
                if (req.io) {
                    req.io.emit('product_updated', {
                        _id: updatedProduct._id,
                        stock: updatedProduct.stock
                    });
                }
            }
        }

        // --- SOCKET IO: Notify Sellers ---
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
        console.error("Add Order Error:", error);
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
            .populate('items.product', 'name coverImage'); 

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order to paid (Manually by Admin/Founder)
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentInfo.status = 'Verified';

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

// @desc    Update order status (Processing -> Shipped -> Delivered -> Cancelled)
// @route   PUT /api/orders/:id/deliver
// @access  Private (Seller/Admin)
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.orderStatus = req.body.status; 
            
            if (req.body.status === 'Delivered') {
                order.deliveredAt = Date.now();
            } else if (req.body.status === 'Shipped') {
                order.shippedAt = Date.now();
            } 
            // --- NEW: CANCELLATION LOGIC ---
            else if (req.body.status === 'Cancelled') {
                order.cancellationReason = req.body.cancellationReason || "Cancelled by seller.";
                order.cancelledAt = Date.now();
                
                // Optional: Stock revert logic here if needed later
                // for (const item of order.items) { ...increase stock... }
            }
            // -------------------------------

            const updatedOrder = await order.save();

            // Notify Customer via Socket
            if (req.io) {
                req.io.emit('order_status_updated', {
                    orderId: updatedOrder._id,
                    customerId: updatedOrder.customer, 
                    status: updatedOrder.orderStatus,
                    reason: updatedOrder.cancellationReason // Send reason if cancelled
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

// @desc    Get Seller's Shop Orders
// @route   GET /api/orders/shop-orders
// @access  Private (Seller)
const getShopOrders = async (req, res) => {
    try {
        const shops = await Shop.find({ owner: req.user._id });
        
        if (!shops || shops.length === 0) {
            return res.status(404).json({ message: 'No shops found for this seller' });
        }

        const shopIds = shops.map(shop => shop._id);

        const orders = await Order.find({ 'items.shop': { $in: shopIds } })
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders (Updated for Founder Dashboard)
// @route   GET /api/orders
// @access  Private (Admin/Founder)
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('customer', 'id name email')
            .populate({
                path: 'items.shop',
                model: 'Shop',
                select: 'name owner paymentQrCode' 
            })
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