const mongoose = require('mongoose');

// Category schema
const CategorySchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
    }
});

// Create model and export that
const Category = module.exports = mongoose.model('Category', CategorySchema);
