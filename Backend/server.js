const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // 1. Cookie Parser Import
const http = require('http'); 
const { Server } = require('socket.io'); 
const connectDB = require('./config/db');

// Import Routes
const userRoutes = require('./routes/userRoutes');
const shopRoutes = require('./routes/shopRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Config
dotenv.config();
connectDB();

const app = express();

// 2. Create HTTP Server explicitly
const server = http.createServer(app);

// 3. Initialize Socket.io
const io = new Server(server, {
    pingTimeout: 60000, 
    cors: {
        origin: "http://localhost:5173", // Frontend URL
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true // Socket ke liye bhi cookies allow karein
    }
});

// --- MIDDLEWARE ---

// 4. CORS Setup for Express (HTTP Requests)
// Cookies allow karne ke liye specific origin aur credentials true hona zaroori hai
app.use(cors({
    origin: "http://localhost:5173", // Frontend URL match hona chahiye
    credentials: true // Cookies allow karne ka switch
}));

app.use(express.json()); // JSON Body Parser
app.use(express.urlencoded({ extended: true })); // URL Encoded Data
app.use(cookieParser()); // 5. Cookie Parser Middleware (Req.cookies read karne ke liye)

// 6. Inject 'io' into Request Object
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Mount Routes
app.use('/api/users', userRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chats', chatRoutes);

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

// 7. Socket.io Connection Logic
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

// 8. Start Server
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});