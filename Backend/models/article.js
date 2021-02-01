'use strict'

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var articleSchema = schema({
    title: String,
    content: String,
    date: { type: Date, default: Date.now },
    image: String
});

//articles --> guarda documentos de este tipo y con esta estructura dentro de la coleccion
module.exports = mongoose.model('Article', articleSchema);