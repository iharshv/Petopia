const { connectToDatabase } = require('./_db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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
        const appointments = db.collection('bookings');

        // Fetch appointments for this user by email
        // Standardize email to lowercase for matching
        const userEmail = decoded.email.toLowerCase();

        const userAppointments = await appointments.find({
            email: userEmail
        }).sort({ createdAt: -1 }).toArray();

        return res.status(200).json(userAppointments);

    } catch (error) {
        console.error('User Appointments API Error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
