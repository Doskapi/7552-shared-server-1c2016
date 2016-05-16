/* Interests.js */

/* Clase encargada de procesar las request de la ruta /interests/* */

var express = require('express');
var router = express.Router();
var BaseQuery = require('./querys/baseQuery');
var InterestQuery = require('./querys/interestQuery');

// Alta de interest
router.post('/', function(req, res) {
  BaseQuery.processQuery(req,res,InterestQuery.addInterest);
});

// Listado de interests
router.get('/', function(req, res) {
  BaseQuery.processQuery(req,res,InterestQuery.getInterests);
});

module.exports = router;
