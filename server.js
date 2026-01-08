const express = require('express');
const app = express();
const cors = require('cors'); 
require('dotenv').config();
const db = require('./db');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

// 1. DEFINE ALLOWED ORIGINS (The "White List")
const allowedOrigins = [
    "http://localhost:5173",                     // For Local Testing
    "https://voting-frontend-fawn.vercel.app"    // ✅ NO SLASH AT THE END
];

// 2. CONFIGURE EXPRESS CORS (For Login/Signup/API)
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

const server = http.createServer(app);

// 3. CONFIGURE SOCKET.IO CORS (For Live Results)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Reuse the same list
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set('io', io);

// Handle WebSocket Connections
io.on('connection', (socket) => {
    console.log(`New Client Connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log('Client Disconnected');
    });
});

app.use(bodyParser.json());

const PORT = process.env.PORT || 5001;

// Routes
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});