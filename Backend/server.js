const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http'); // 1. Node ka native HTTP server module
const { Server } = require('socket.io'); // 2. Socket.io Import
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

// 3. Create HTTP Server explicitly
// Express app ko HTTP server ke andar wrap kar rahe hain
const server = http.createServer(app);

// 4. Initialize Socket.io
const io = new Server(server, {
    pingTimeout: 60000, // 60s wait karega connection close karne se pehle
    cors: {
        origin: "http://localhost:5173", // Frontend ka URL (React)
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// Middleware
app.use(cors());
app.use(express.json()); // Body Parser

// 5. IMPORTANT: Inject 'io' into Request Object
// Yeh middleware sabse zaroori hai. Iske bina controllers me 'req.io' nahi chalega.
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
    res.send('API is running with Socket.io...');
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

// 6. Socket.io Connection Logic
// Jab frontend (React) connect karega, ye block chalega
io.on("connection", (socket) => {
    console.log("Connected to socket.io:", socket.id);

    // Setup: User joins his own room (Setup event frontend se aayega)
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

// 7. Change app.listen to server.listen
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});