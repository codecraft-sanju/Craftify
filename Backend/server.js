// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http'); 
const { Server } = require('socket.io'); 
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const shopRoutes = require('./routes/shopRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const chatRoutes = require('./routes/chatRoutes');
const cartRoutes = require('./routes/cartRoutes');
const webpush = require('web-push'); 

// CHANGES MADE: Added Razorpay require
const Razorpay = require('razorpay');

// Config
dotenv.config();
connectDB();

// CHANGES MADE: Initialize Web Push with VAPID keys from environment variables
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        `mailto:${process.env.VAPID_EMAIL || 'sanjaychoudhury693@gmail.com'}`,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
    console.log("Web Push VAPID keys configured successfully.");
} else {
    console.warn("VAPID keys not found in .env file. Push notifications will not work.");
}
// CHANGES MADE: Push Notification Logic End

// CHANGES MADE: Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: 'rzp_live_SKUDOOica8z6I6',
    key_secret: '5kLAXLkhmIuGv1S2e7e5qURB',
});

const app = express();

// Create HTTP Server explicitly
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    pingTimeout: 60000, 
    cors: {
        origin: process.env.FRONTEND_URL, // Frontend URL
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// --- MIDDLEWARE ---

// CORS Setup
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Inject 'io' into Request Object
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --- MOUNT ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/cart', cartRoutes);

// CHANGES MADE: Added Razorpay create-order route
app.post('/create-order', async (req, res) => {
    try {
        const options = {
            amount: 1 * 100,
            currency: "INR",
            receipt: "test_receipt_1"
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- NEW: HEALTH CHECK ROUTE (For Founder Dashboard) ---
app.get('/api/health', (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now()
    };
    try {
        res.send(healthcheck);
    } catch (error) {
        healthcheck.message = error;
        res.status(503).send();
    }
});

// Test Route
app.get('/', (req, res) => {
    res.send('API is running with Cookies & Socket.io...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Socket.io Connection Logic
io.on("connection", (socket) => {
    console.log("Connected to socket.io:", socket.id);

    // Setup: User joins his own room
    socket.on("setup", (userData) => {
        if(userData && userData._id) {
            socket.join(userData._id);
            console.log("User joined room:", userData._id);
            socket.emit("connected");
        }
    });

    // Chat: Join Chat Room
    socket.on("join_chat", (room) => {
        socket.join(room);
        console.log("User joined chat room: " + room);
    });

    // Typing Indicators
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop_typing", (room) => socket.in(room).emit("stop_typing"));

    socket.on("disconnect", () => {
        console.log("USER DISCONNECTED");
    });
});

const PORT = process.env.PORT || 5000;

// Start Server
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});