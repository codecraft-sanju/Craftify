// backend/controllers/orderController.js
const Order = require('../models/Order');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const User = require('../models/User'); // For Push Notifications
const sendWhatsApp = require('../utils/sendWhatsApp'); 
const webpush = require('web-push'); 

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

        // --- VALIDATION Payment Info (UPDATED FOR RAZORPAY) ---
        if (!paymentInfo || !paymentInfo.id) {
            return res.status(400).json({ message: 'Payment verification failed. Razorpay ID missing.' });
        }

        // 1. Create the Order (Directly using orderItems, customization/colors removed)
        const order = new Order({
            customer: req.user._id,
            items: orderItems, 
            shippingAddress,   
            paymentInfo: {
                method: 'Online',
                razorpayPaymentId: paymentInfo.id,
                status: paymentInfo.status === 'paid' ? 'Success' : 'Pending' 
            },
            // --- GATEKEEPER LOGIC START ---
            isVerifiedByFounder: true, 
            orderStatus: 'Processing',
            // ------------------------------
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalAmount: totalPrice,
            isPaid: true,
            paidAt: Date.now()
        });

        const createdOrder = await order.save();

        // 2. STOCK MANAGEMENT & REAL-TIME ALERTS
        for (const item of orderItems) {
            const updatedProduct = await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.qty, sold: item.qty } },
                { new: true } 
            );

            if (updatedProduct && req.io) {
                req.io.emit('product_updated', {
                    _id: updatedProduct._id,
                    stock: updatedProduct.stock
                });
            }
        }

        // 3. --- WHATSAPP NOTIFICATION TRIGGER (TO CUSTOMER) ---
        if (req.user && req.user.phone) {
            try {
                const customerName = req.user.name.split(' ')[0]; 
                const shortOrderId = createdOrder._id.toString().slice(-6).toUpperCase();
                
                let productDetails = "";
                orderItems.forEach(item => {
                    productDetails += `• ${item.name} (Qty: ${item.qty}) - ₹${item.price}\n`;
                });

                const message = 
`*Order Confirmation: #${shortOrderId}* ✅

Hello ${customerName},

Thank you for shopping with Giftomize! Your payment has been received and your order is confirmed.

*Order Details:*
${productDetails}
*Total Amount:* ₹${totalPrice}
The seller will contact you shortly on WhatsApp for any customization details or order updates.
Best Regards,
*Team Giftomize*`;

                sendWhatsApp(req.user.phone, message).catch(() => {});

            } catch (msgError) {
              
            }
        }
        const involvedShops = [...new Set(orderItems.map(item => item.shop.toString()))];
        
        try {
            const shopsToNotify = await Shop.find({ _id: { $in: involvedShops } });
            
            for (const shop of shopsToNotify) {
                if (shop.phone) {
                    const shortOrderId = createdOrder._id.toString().slice(-6).toUpperCase();
                    
                    // Filter items specific to this shop
                    const shopItems = orderItems.filter(item => item.shop.toString() === shop._id.toString());
                    let shopProductDetails = "";
                    shopItems.forEach(item => {
                        shopProductDetails += `• ${item.name} (Qty: ${item.qty}) - ₹${item.price}\n`;
                    });

                    const customerName = req.user.name;
                    const customerPhone = shippingAddress.phone || req.user.phone || 'Not provided';
                    const fullAddress = `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.postalCode}`;

                const sellerMsg = `🎉 New Order on Giftomize! (Order ID: #${shortOrderId})\n\n*Customer Note:* "Hello, I have successfully placed an order on the Giftomize website. Please process my order."\n\n*🛍️ Order Details:*\n${shopProductDetails}\n*👤 Customer Information:*\nName: ${customerName}\nPhone: ${customerPhone}\nAddress: ${fullAddress}\n\nPlease reach out to the customer directly via WhatsApp for any photos, sizes, or specific customization details required. Happy Selling!`;
                    
                    sendWhatsApp(shop.phone, sellerMsg).catch(() => {}); 
                }
                
                // Push Notification Logic
                const shopOwner = await User.findById(shop.owner);
                if (shopOwner && shopOwner.pushSubscriptions && shopOwner.pushSubscriptions.length > 0) {
                    const payload = JSON.stringify({
                        title: 'New Paid Order!',
                        body: `A new order has arrived for your shop (${shop.name}).`,
                        url: '/my-shop' 
                    });

                    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
                       webpush.setVapidDetails(
                            'mailto:sanjaychoudhury693@gmail.com', 
                            process.env.VAPID_PUBLIC_KEY,
                            process.env.VAPID_PRIVATE_KEY
                        );
                        
                        shopOwner.pushSubscriptions.forEach(sub => {
                            webpush.sendNotification(sub, payload).catch(err => {
                                console.error("Push Notification Error for specific sub:", err);
                            });
                        });
                    }
                }
            }
        } catch (notifyError) {
            console.error("Seller Notification Error:", notifyError); 
        }

        // --- SOCKET IO: Notify FOUNDER & SELLERS ---
        if (req.io) {
            req.io.emit('new_order_placed', {
                orderId: createdOrder._id,
                totalAmount: createdOrder.totalAmount,
                customerName: req.user.name,
                requiresApproval: false 
            });

            req.io.emit('order_verified', {
                orderId: createdOrder._id,
                shopIds: involvedShops,
                status: 'Processing'
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
            order.orderStatus = 'Processing'; 
            // ----------------------

            const updatedOrder = await order.save();

            // NOW Notify involved sellers because order is valid
            const involvedShops = [...new Set(order.items.map(item => item.shop.toString()))];
            
            // --- WHATSAPP TO SELLERS (Silent) ---
            try {
                const shopsToNotify = await Shop.find({ _id: { $in: involvedShops } });
                
                for (const shop of shopsToNotify) {
                    if (shop.phone) {
                        const shortOrderId = updatedOrder._id.toString().slice(-6).toUpperCase();
                        const sellerMsg = `Hello ${shop.name}, great news! You have received a new verified order (ID: #${shortOrderId}) on Giftomize. The payment is approved, and it is ready for processing. Please check your seller dashboard for more details. Happy Selling!`;
                        
                        sendWhatsApp(shop.phone, sellerMsg).catch(() => {}); 
                    }
                    const shopOwner = await User.findById(shop.owner);
                    if (shopOwner && shopOwner.pushSubscriptions && shopOwner.pushSubscriptions.length > 0) {
                        const payload = JSON.stringify({
                            title: 'New Verified Order! 🎉',
                            body: `Aapke shop (${shop.name}) ke liye ek naya order (ID: #${updatedOrder._id.toString().slice(-6).toUpperCase()}) aaya hai.`,
                            url: '/my-shop' // Yeh URL frontend handle karega
                        });

                        if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
                           webpush.setVapidDetails(
                                'mailto:sanjaychoudhury693@gmail.com', 
                                process.env.VAPID_PUBLIC_KEY,
                                process.env.VAPID_PRIVATE_KEY
                            );
                            
                            shopOwner.pushSubscriptions.forEach(sub => {
                                webpush.sendNotification(sub, payload).catch(err => {
                                    console.error("Push Notification Error for specific sub:", err);
                                });
                            });
                        } else {
                            console.warn("VAPID keys not set in env. Push notifications skipped.");
                        }
                    }
                    // Push Notification Logic End
                }
            } catch (notifyError) {
                console.error("Notification Error:", notifyError); 
            }
            // ------------------------------------

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
            isVerifiedByFounder: true 
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
    verifyOrderPayment,
    settlePayout,
    updateOrderStatus,
    getMyOrders,
    getShopOrders,
    getOrders,    
};