const { connectToDatabase } = require('./_db');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'petopia-secret-key');
        const db = await connectToDatabase();
        const users = db.collection('users');

        if (req.method === 'GET') {
            const user = await users.findOne({ _id: new ObjectId(decoded.userId) });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Don't send password
            const { password, ...userData } = user;
            return res.status(200).json(userData);
        }

        if (req.method === 'POST') {
            const { name, phone, dob, gender } = req.body;

            await users.updateOne(
                { _id: new ObjectId(decoded.userId) },
                { $set: { name, phone, dob, gender, updatedAt: new Date() } }
            );

            return res.status(200).json({ success: true, message: 'Profile updated successfully!' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Profile API Error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
