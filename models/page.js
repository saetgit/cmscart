var moongoes = require('mongoose');

//page schema

var pageschema = moongoes.Schema({
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
        type: number,
    }
});

var page = module.exports = moongoes.model('page', pageschema);