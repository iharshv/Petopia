const { connectToDatabase } = require('./_db');

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
        const { petName, petType, breed, service, date, time, ownerName, phone, email, notes } = req.body;

        // Validation
        if (!petName || !petType || !service || !date || !time || !ownerName || !phone) {
            return res.status(400).json({ error: 'Please fill all required fields' });
        }

        const db = await connectToDatabase();
        const bookings = db.collection('bookings');

        // Create booking
        const result = await bookings.insertOne({
            petName,
            petType,
            breed: breed || '',
            service,
            date,
            time,
            ownerName,
            phone,
            email: email || '',
            notes: notes || '',
            status: 'pending',
            createdAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Booking confirmed! We will contact you shortly.',
            bookingId: result.insertedId
        });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
};
