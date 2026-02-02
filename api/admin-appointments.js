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
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // CHECK FOR ADMIN ROLE
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const db = await connectToDatabase();
        const bookings = db.collection('bookings');

        if (req.method === 'GET') {
            const allBookings = await bookings.find({}).sort({ createdAt: -1 }).toArray();
            return res.status(200).json(allBookings);
        }

        if (req.method === 'POST') {
            const { bookingId, status } = req.body;

            if (!['approved', 'rejected', 'pending'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }

            await bookings.updateOne(
                { _id: new ObjectId(bookingId) },
                { $set: { status, updatedAt: new Date() } }
            );

            return res.status(200).json({ success: true, message: `Appointment ${status}!` });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Admin API Error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
