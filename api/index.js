const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('./_db');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'petopia-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

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

// Helper: Admin Middleware
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};

// Routes

// Ping
app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', message: 'Petopia API is alive!', time: new Date().toISOString() });
});

// Auth: Register
app.post('/api/register', async (req, res) => {
    try {
        const { name, email: rawEmail, phone, dob, gender, password } = req.body;
        const email = rawEmail ? rawEmail.toLowerCase() : null;

        if (!name || !email || !phone || !dob || !gender || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const db = await connectToDatabase();
        const users = db.collection('users');

        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Saving as plain text as per requested schema screenshot
        const result = await users.insertOne({
            name,
            email,
            password: password, // Plain text as requested
            role: 'client',
            __v: 0,
            dob,
            gender,
            phone
        });

        res.status(201).json({ success: true, message: 'Registration successful!', userId: result.insertedId });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Auth: Login
app.post('/api/login', async (req, res) => {
    try {
        const { email: rawEmail, password } = req.body;
        const email = rawEmail ? rawEmail.toLowerCase() : null;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const db = await connectToDatabase();
        const users = db.collection('users');

        const user = await users.findOne({ email });
        // Checking plain text password
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, name: user.name, role: user.role || 'client' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: { name: user.name, email: user.email, role: user.role || 'client' }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Profile: Get & Update
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.userId) });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const { password, ...userData } = user;
        res.json(userData);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/profile', authenticateToken, async (req, res) => {
    try {
        const { name, phone, dob, gender } = req.body;
        const db = await connectToDatabase();
        await db.collection('users').updateOne(
            { _id: new ObjectId(req.user.userId) },
            {
                $set: { name, phone, dob, gender, updatedAt: new Date() },
                $inc: { __v: 1 }
            }
        );
        res.json({ success: true, message: 'Profile updated!' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Projects (Appointments)
// POST /api/projects - Create a new project (booking)
app.post('/api/projects', async (req, res) => {
    try {
        const { petName, petType, breed, service, date, time, ownerName, phone, email, notes } = req.body;
        if (!petName || !petType || !service || !date || !time || !ownerName || !phone) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const db = await connectToDatabase();
        const result = await db.collection('bookings').insertOne({
            petName, petType, breed: breed || '', service, date, time, ownerName, phone,
            email: email || '', notes: notes || '', status: 'pending', createdAt: new Date()
        });

        res.status(201).json({ success: true, message: 'Project created!', projectId: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/projects - Fetch all projects (Admin)
app.get('/api/projects', authenticateToken, adminOnly, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const projects = await db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/projects/my/:clientId - Get projects for client (using email or ID)
app.get('/api/projects/my/:clientId', authenticateToken, async (req, res) => {
    try {
        // Here clientId is typically the email from Crossfade patterns
        const db = await connectToDatabase();
        const projects = await db.collection('bookings').find({
            email: req.params.clientId.toLowerCase()
        }).sort({ createdAt: -1 }).toArray();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/projects/:id/status - Update status
app.put('/api/projects/:id/status', authenticateToken, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const db = await connectToDatabase();
        await db.collection('bookings').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status, updatedAt: new Date() } }
        );
        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Export the Express app for Vercel
module.exports = app;
