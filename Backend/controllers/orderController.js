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

        // 1. Create the Order
        const order = new Order({
            customer: req.user._id,
            items: orderItems, // Frontend should send shopId in each item
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalAmount: totalPrice,
        });

        const createdOrder = await order.save();

        // 2. STOCK MANAGEMENT & REAL-TIME ALERTS
        // Order place hote hi stock kam karna padega aur sellers ko notify karna padega
        
        // Is order me jitne bhi unique shops involved hain, unki list banao
        const involvedShops = [...new Set(orderItems.map(item => item.shop))];

        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                // Stock reduce karo
                product.stock = product.stock - item.qty;
                await product.save();

                // --- SOCKET IO: Update Product Stock Instantly ---
                // Agar koi aur user us product ko dekh raha hai, use turant dikhega "Only X left"
                if (req.io) {
                    req.io.emit('product_updated', {
                        _id: product._id,
                        stock: product.stock
                    });
                }
            }
        }

        // --- SOCKET IO: Notify Sellers ---
        // Sellers ke dashboard par pop-up aayega "New Order!"
        if (req.io) {
            req.io.emit('new_order_placed', {
                orderId: createdOrder._id,
                shopIds: involvedShops, // Client side check karega: "Kya ye order meri shop ke liye hai?"
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
        // Customer ka naam aur email populate karo
        const order = await Order.findById(req.params.id).populate(
            'customer',
            'name email'
        );

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order to paid (Usually hit by Payment Gateway Webhook or Frontend after success)
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            // Data from Razorpay/Stripe/PayPal
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address,
            };

            const updatedOrder = await order.save();

            // --- SOCKET IO: Notify Seller to Ship Item ---
            // Payment confirm hote hi seller ko notification: "Payment Received, Ready to Ship"
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
            order.orderStatus = req.body.status; // 'Shipped' or 'Delivered'
            
            if (req.body.status === 'Delivered') {
                order.deliveredAt = Date.now();
            } else if (req.body.status === 'Shipped') {
                order.shippedAt = Date.now();
            }

            const updatedOrder = await order.save();

            // --- SOCKET IO: Notify Customer ---
            // Customer ke phone/laptop par notification: "Your Order has been Shipped!"
            if (req.io) {
                req.io.emit('order_status_updated', {
                    orderId: updatedOrder._id,
                    customerId: updatedOrder.customer, // Frontend check karega "Kya ye mera order hai?"
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
        // Sirf wahi orders laao jo logged in user ne kiye hain
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
        // 1. Seller ki shop dhundo
        const shop = await Shop.findOne({ owner: req.user._id });
        
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found for this seller' });
        }

        // 2. Wo orders dhundo jisme is shop ka item ho ('items.shop' check karega)
        // .sort({ createdAt: -1 }) se latest order sabse upar aayega
        const orders = await Order.find({ 'items.shop': shop._id })
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });

        // Note: Frontend par hum filter kar lenge ki exactly kitna amount is seller ka hai
        // Kyunki 'Order' object me pure cart ka total hota hai.
        
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
    getShopOrders, // Seller ke liye
    getOrders,     // Founder ke liye
};