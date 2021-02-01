'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');
var Article = require('../models/article');

var controller = {

    datosCurso: (req, res) => {
        var hola = req.body.hola;

        return res.status(200).send({
            nombre: 'Alvaro',
            apellido: 'Escobar',
            hola
        });
    },

    test: (req, res) => {
        return res.status(200).send({ message: 'Soy la accion test del controller' });
    },

    save: (req, res) => {
        //Recoger parametros por post
        var params = req.body;

        //Validar datos (validator)
        try {

            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

        } catch (error) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos'
            });
        }

        if (validate_title && validate_content) {

            //Crear el objeto a guardar
            var article = new Article();

            //Asignar valores
            article.title = params.title;
            article.content = params.content;

            if (params.image) {
                article.image = params.image;
            } else {
                article.image = null;

            }

            //Guardar el articulo
            article.save((err, articleStored) => {
                if (err || !articleStored) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El articulo NO se ha podido guardar'
                    });
                }
                //Devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    article: articleStored
                });
            });



        } else {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos NO son validos'
            });
        }

    },

    getArticles: (req, res) => {

        var query = Article.find({});

        var last = req.params.last;
        if (last || last != undefined) {
            query.limit(5);
        }

        //Find
        query.sort('-_id').exec((err, articles) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al listar articulos'
                });
            }
            if (!articles) {
                return res.status(404).send({
                    status: 'error',
                    message: 'no hay articulos para mostrar'
                });
            }
            return res.status(200).send({
                status: 'success',
                articles
            });
        });

    },

    getArticle: (req, res) => {

        //Recoger el id de la url
        var articleId = req.params.id;

        //Comprobar que existe
        if (!articleId || articleId == null) {
            return res.status(404).send({
                status: 'error',
                message: 'no existe el articulo'
            });
        }

        //Buscar el articulo
        Article.findById(articleId, (err, article) => {

            if (err || !article) {
                return res.status(404).send({
                    status: 'error',
                    message: 'no existe el articulo'
                });
            }

            //Devolverlo en json
            return res.status(200).send({
                status: 'success',
                article
            });
        })

    },

    update: (req, res) => {
        //Recoger el id del articulo de la url
        var articleId = req.params.id;

        //Recoger los datos que llegan por put
        var params = req.body;

        //Validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (error) {
            return res.status(404).send({
                status: 'error',
                message: 'no existe el articulo'
            });
        }

        if (validate_title && validate_content) {
            //Find and update
            Article.findOneAndUpdate({ _id: articleId }, params, { new: true }, (err, articleUpdate) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: "Error al actualizar"
                    });
                }
                if (!articleUpdate) {
                    return res.status(404).send({
                        status: 'error',
                        message: "NO existe el articulo"
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleUpdate
                });

            });

        } else {
            //Devolver respuesta
            return res.status(500).send({
                status: 'error',
                message: "la validacion no es correcta"
            });
        }

    },

    delete: (req, res) => {
        //Recoger el id de la url
        var articleId = req.params.id;

        //Buscar y borrar
        Article.findOneAndDelete({ _id: articleId }, (err, articleRemoved) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error al borrar"
                });
            }
            if (!articleRemoved) {
                return res.status(404).send({
                    status: 'error',
                    message: "No se ha encontrado el articulo a borrar"
                });
            }
            return res.status(200).send({
                status: 'success',
                article: articleRemoved,
                message: "Articulo # " + articleId + " borrado exitosamente"
            });
        });

    },

    upload: (req, res) => {

        //Configurar el modulo del connect multiparty router/article.js

        //Recoger el fichero de la req
        var file_name = 'Imagen no subida...';

        if (!req.files) {
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }

        //Conseguir nombre y la extension del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        // *ADVERTENCIA* EN LINUX o MAC
        //  var file_split = file_path.split('/');

        //Nombre del archivo
        var file_name = file_split[2];

        //Extension del fichero
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

        //Comprobar la extension, solo imagenes, si es valida borrar el fichero
        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {
            //Borrar el archivo subido
            fs.unlink(file_path, (err) => {

                return res.status(500).send({
                    status: 'error',
                    message: "La extension de la imagen no es valida"
                });

            });
        } else {
            //Si todo es valido
            var articleId = req.params.id;

            if (articleId) {

                //Buscar el articulo, asignarle el nombre de la imagen y actualizarlo
                Article.findOneAndUpdate({ _id: articleId }, { image: file_name }, { new: true }, (err, articleUpdate) => {
                    if (err || !articleUpdate) {
                        return res.status(500).send({
                            status: 'error',
                            message: "Error al guardar la imagen"
                        });
                    }

                    return res.status(200).send({
                        status: 'success',
                        article: articleUpdate

                    });
                });

            } else {
                return res.status(200).send({
                    status: 'success',
                    image: file_name
                });
            }

        }
    },

    getImage: (req, res) => {

        var file = req.params.image;
        var path_file = './upload/articles/' + file;

        fs.access(path_file, fs.constants.F_OK, (err) => {

            if (err) {
                return res.status(404).send({
                    status: 'error',
                    message: "La imagen no existe"
                });
            }

            return res.sendFile(path.resolve(path_file));

        });

    },

    search: (req, res) => {

        //Sacar el String a buscar 
        var searchString = req.params.search;

        //Find Or
        Article.find({
            "$or": [

                { "title": { "$regex": searchString, "$options": "i" } },
                { "content": { "$regex": searchString, "$options": "i" } }

            ]
        }).sort([
            ['date', 'descending']
        ]).exec((err, articles) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error en la petición"
                });
            }

            if (!articles || articles.length <= 0) {
                return res.status(404).send({
                    status: 'error',
                    message: "No hay coincidencias"
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });
        });


    }



}; //end controller

module.exports = controller;