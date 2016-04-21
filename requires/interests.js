var express = require('express');
var router = express.Router();
var Query = require('./query');
var RequestCallback = require("../callbacks/requestCallback");

// Alta de interest
router.post('/', function(req, res) {
  Query.processQuery(req,res,new RequestCallback(req,res,Query.addInterest));
});

// Listado de interests
router.get('/', function(req, res) {
  Query.processQuery(req,res,new RequestCallback(req,res,Query.getInterests));
});

module.exports = router;
