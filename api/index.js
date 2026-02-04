const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'petopia-secret-key';
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection (Mongoose style like Crossfade)
mongoose.connect(MONGODB_URI)
    .then(() => console.log("MongoDB Connected (Petopia)"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// Models (Matching Crossfade User.js)
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, lowercase: true, trim: true },
    password: String, // Saved as plain text like Crossfade
    role: { type: String, default: 'client' },
    gender: String,
    dob: String,
    phone: String,
    __v: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Project Model (Matching Crossfade Project.js)
const projectSchema = new mongoose.Schema({
    title: String,
    description: String,
    petName: String,
    petType: String,
    service: String,
    date: String,
    time: String,
    ownerName: String,
    phone: String,
    email: String,
    notes: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'Completed'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);

// Helper: Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Routes

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, dob, gender, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const newUser = new User({ name, email, phone, dob, gender, password });
        await newUser.save();

        res.status(201).json({ success: true, message: 'Registration successful!', user: newUser });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase(), password }); // Plain text check like Crossfade

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, name: user.name, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: { name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Profile
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/profile', authenticateToken, async (req, res) => {
    try {
        const { name, phone, dob, gender } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: { name, phone, dob, gender } },
            { new: true }
        );
        res.json({ success: true, message: 'Profile updated!', user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Projects
app.post('/api/projects', async (req, res) => {
    try {
        const newProject = new Project(req.body);
        await newProject.save();
        res.status(201).json({ success: true, message: 'Project created!', projectId: newProject._id });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/projects/my/:email', authenticateToken, async (req, res) => {
    try {
        const projects = await Project.find({ email: req.params.email.toLowerCase() }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/projects/:id/status', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
        await Project.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status } });
        res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Ping
app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', message: 'Petopia API is alive!', time: new Date().toISOString() });
});

module.exports = app;
