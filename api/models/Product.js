const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: [{ type: String }],
    weight: String,
    price: { type: Number },
    mrp: { type: Number },
    image: String,
    description: String,
    variants: [{
        weight: String,
        flavor: String,
        price: { type: Number, required: true },
        mrp: { type: Number, required: true }
    }],
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
