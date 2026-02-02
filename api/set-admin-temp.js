const { connectToDatabase } = require('./_db');

module.exports = async (req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, secret } = req.body;

    if (secret !== 'petopia-admin-fix-2026') {
        return res.status(401).json({ error: 'Invalid secret key' });
    }

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const db = await connectToDatabase();
        const users = db.collection('users');

        const result = await users.updateOne(
            { email: email.toLowerCase() },
            { $set: { role: 'admin' } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: `User ${email} has been promoted to Admin.`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Admin promotion error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
