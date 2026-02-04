const mongoose = require('mongoose');

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

module.exports = mongoose.model('Project', projectSchema);
