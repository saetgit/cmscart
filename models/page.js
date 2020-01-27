const mongoose = require('mongoose');

// Page schema
const PageSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
    },
    content: {
        type: String,
        required: true
    },
    sorting: {
        type: Number
    }
});

// Create model and export that
const Page = module.exports = mongoose.model('Page', PageSchema);
