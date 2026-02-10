// backend/controllers/orderController.js
const Order = require('../models/Order');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const sendOrderConfirmation = require('../utils/sendWhatsApp'); 

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
                status: 'Pending' 
            },
            // --- GATEKEEPER LOGIC START ---
            // Initially FALSE. Seller cannot see this.
            isVerifiedByFounder: false,
            orderStatus: 'Verifying Payment',
            // ------------------------------
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
                // Decrease Stock, Increase Sold count
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

        // 3. --- WHATSAPP NOTIFICATION TRIGGER ---
        if (req.user) {
            sendOrderConfirmation(createdOrder, req.user)
                .catch(err => console.error("WhatsApp Notification Failed:", err.message));
        }

        // --- SOCKET IO: Notify FOUNDER Only (Not Sellers yet) ---
        if (req.io) {
            // Broadcasting to 'admin' room or generic 'new_order_placed'
            // NOTE: Sellers won't see it in their list yet due to getShopOrders filter
            req.io.emit('new_order_placed', {
                orderId: createdOrder._id,
                totalAmount: createdOrder.totalAmount,
                customerName: req.user.name,
                requiresApproval: true
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

// @desc    Founder Approves Payment (Unlocks Order for Seller)
// @route   PUT /api/orders/:id/pay
// @access  Private (Founder/Admin)
const verifyOrderPayment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentInfo.status = 'Verified';

            // --- THE UNLOCK KEY ---
            order.isVerifiedByFounder = true; 
            order.orderStatus = 'Processing'; // Now Seller knows to process it
            // ----------------------

            const updatedOrder = await order.save();

            // NOW Notify involved sellers because order is valid
            const involvedShops = [...new Set(order.items.map(item => item.shop.toString()))];
            
            if (req.io) {
                req.io.emit('order_verified', {
                    orderId: updatedOrder._id,
                    shopIds: involvedShops,
                    status: 'Processing'
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

// @desc    Founder Settles Payout to Seller (Upload Proof)
// @route   PUT /api/orders/:id/payout
// @access  Private (Founder/Admin)
const settlePayout = async (req, res) => {
    try {
        const { transactionId, proofImage } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.payoutInfo = {
                status: 'Settled',
                transactionId: transactionId || "CASH/MANUAL",
                proofImage: proofImage || "", // URL from Cloudinary
                settledAt: Date.now()
            };

            const updatedOrder = await order.save();
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
            // --- CANCELLATION LOGIC ---
            else if (req.body.status === 'Cancelled') {
                order.cancellationReason = req.body.cancellationReason || "Cancelled by seller.";
                order.cancelledAt = Date.now();
            }
            // ---------------------------

            const updatedOrder = await order.save();

            // Notify Customer via Socket
            if (req.io) {
                req.io.emit('order_status_updated', {
                    orderId: updatedOrder._id,
                    customerId: updatedOrder.customer, 
                    status: updatedOrder.orderStatus,
                    reason: updatedOrder.cancellationReason
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

// @desc    Get Seller's Shop Orders (THE GATEKEEPER)
// @route   GET /api/orders/shop-orders
// @access  Private (Seller)
const getShopOrders = async (req, res) => {
    try {
        const shops = await Shop.find({ owner: req.user._id });
        
        if (!shops || shops.length === 0) {
            return res.status(404).json({ message: 'No shops found for this seller' });
        }

        const shopIds = shops.map(shop => shop._id);

        const orders = await Order.find({ 
            'items.shop': { $in: shopIds },
            // --- IMPORTANT: Only show orders verified by Founder ---
            isVerifiedByFounder: true 
            // -------------------------------------------------------
        })
        .populate('customer', 'name email')
        .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders (For Founder Dashboard)
// @route   GET /api/orders
// @access  Private (Admin/Founder)
const getOrders = async (req, res) => {
    try {
        // Founder sees EVERYTHING (Verified and Unverified)
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
    verifyOrderPayment, // Replaces updateOrderToPaid
    settlePayout,       // New Payout Logic
    updateOrderStatus,
    getMyOrders,
    getShopOrders,
    getOrders,    
};