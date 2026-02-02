const { connectToDatabase } = require('./_db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, phone, dob, gender, password } = req.body;

        // Validation
        if (!name || !email || !phone || !dob || !gender || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const db = await connectToDatabase();
        const users = db.collection('users');

        // Check if user already exists
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await users.insertOne({
            name,
            email,
            phone,
            dob,
            gender,
            password: hashedPassword,
            role: 'user',
            createdAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            userId: result.insertedId
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
};
