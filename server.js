const express = require('express')
const app = express();

// const {jwtAuthMiddleware} = require('./jwt');

require('dotenv').config();
const db = require('./db');
// const passport = require('./auth');

const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // req.body
const PORT = process.env.PORT || 3000;

// Import the router files
const userRoutes = require('./routes/userRoutes');
const CandidateRoutes = require('./routes/candidateRoutes');

// Use the routers
app.use('/user', userRoutes);
app.use('/candidate', CandidateRoutes);
// app.use('/', menuItemRoutes);

app.listen(PORT, ()=>{
    console.log('listening on port 3000');
});