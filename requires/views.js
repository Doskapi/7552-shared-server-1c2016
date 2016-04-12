var express = require('express');
var router = express.Router();
var path = require("path");

//Get Views
router.get('/*', function(req, res) {
  var file = req.url;
  if(file == "/") file = "/index.html";
  res.sendFile(path.join(__dirname,"../GUI",file));
});

module.exports = router;
