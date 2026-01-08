const express = require('express');
const app = express();
const cors = require('cors'); // Define cors up here
require('dotenv').config();
const db = require('./db');
const bodyParser = require('body-parser');

// 1. IMPORT HTTP AND SOCKET.IO  <--- CHANGED
const http = require('http');
const { Server } = require('socket.io');

// 2. CREATE THE SERVER  <--- CHANGED
// We wrap the express 'app' in a standard HTTP server
const server = http.createServer(app);

// 3. INITIALIZE SOCKET.IO WITH CORS  <--- CHANGED
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', 'https://voting-frontend-fawn.vercel.app/',
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Pass 'io' to the app so your Controllers can access it later
app.set('io', io);

// Handle WebSocket Connections
io.on('connection', (socket) => {
    console.log(`New Client Connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
        console.log('Client Disconnected');
    });
});

app.use(
  cors({
    origin: 'http://localhost:5173',  
    credentials: true
  })
);

app.use(bodyParser.json());

const PORT = process.env.PORT || 5001;

// Import the router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

// Use the routers
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend connected successfully' });
});

// 4. LISTEN USING 'server' INSTEAD OF 'app' <--- CHANGED
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});