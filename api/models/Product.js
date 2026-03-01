const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: [{ type: String }],
    weight: String,
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    image: String,
    description: String,
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
