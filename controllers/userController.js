const User = require('../models/user');
const { generateToken } = require('../jwt');

// POST /signup
// backend/controllers/userController.js
exports.signup = async (req, res) => {
    try {
        const data = req.body;
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin already exists' });
        }

        // 1. Check if Aadhar already exists
        const existingAadhar = await User.findOne({ aadhar: data.aadhar });
        if (existingAadhar) {
            return res.status(400).json({ error: 'User with this Aadhar Number already exists' });
        }

        // 2. Check if Email already exists (THIS IS THE FIX)
        const existingEmail = await User.findOne({ email: data.email });
        if (existingEmail) {
            return res.status(400).json({ error: 'User with this Email already exists' });
        }

        // 3. Create User
        const newUser = new User(data);
        const response = await newUser.save();
        console.log('User created');

        // 4. Generate Token
        const payload = { id: response.id };
        const token = generateToken(payload);

        res.status(200).json({ response: response, token: token });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Signup Failed' });
    }
};

// POST /login
exports.login = async (req, res) => {
    try {
        const { aadhar, password } = req.body;
        const user = await User.findOne({ aadhar: aadhar });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const payload = {
            id: user.id,
        };
        const token = generateToken(payload);

        res.json({ token, role: user.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// GET /profile
exports.getProfile = async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// PUT /profile/password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);

        // Fixed: Use currentPassword here, not password
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// GET / (Get all users)
exports.getAllUsers = async (req, res) => {
    try {
        // Fixed: Use User.find(), not Person.find()
        const data = await User.find();
        console.log('data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};