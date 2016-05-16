/* Views.js */

/* Clase encargada de procesar las request de la ruta /* */

var express = require('express');
var router = express.Router();
var path = require("path");

// Procesa la request solicitada y le devuelve el html correspondiente
router.get('/*', function(req, res) {
  var file = req.url;
  if(file == "/") file = "/index.html";
  res.sendFile(path.join(__dirname,"../GUI",file));
});

module.exports = router;
