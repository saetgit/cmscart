const mongoose = require('mongoose');

// Product schema
const ProductSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
    },
    desc: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true

    },
    image: {
        type: String,
    }
});

// Create model and export that
const Product = module.exports = mongoose.model('Product', ProductSchema);
