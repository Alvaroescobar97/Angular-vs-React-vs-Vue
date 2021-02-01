'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3900;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api-rest-blog', { useNewUrlParser: true }).then(() => {
    console.log('BD is already Act!! B)');

    //Crear Servidor y escuchar peticiones HTTP
    app.listen(port, () => {
        console.log('Servidor corriento en http://localhost:' + port);
    })
});