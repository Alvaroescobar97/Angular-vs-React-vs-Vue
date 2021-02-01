'use strict'

var express = require('express');
var articleController = require('../controllers/article');

var router = express.Router();

var multiparty = require('connect-multiparty');
var md_upload = multiparty({ uploadDir: './upload/articles' });

//Rutas de prueba
router.post('/datos-curso', articleController.datosCurso);
router.get('/test-de-controlador', articleController.test);

// Rutas utiles
router.post('/save', articleController.save);
router.get('/articles/:last?', articleController.getArticles);
router.get('/article/:id', articleController.getArticle);
router.put('/article/:id', articleController.update);
router.delete('/article/:id', articleController.delete);
router.post('/upload-image/:id?', md_upload, articleController.upload);
router.get('/get-image/:image', articleController.getImage);
router.get('/search/:search', articleController.search);

module.exports = router;