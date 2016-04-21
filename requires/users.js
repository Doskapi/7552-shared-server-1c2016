var express = require('express');
var router = express.Router();
var fs = require("fs");
var QueryHelper = require('../helpers/queryHelper');
var Query = require('./query');
var RequestCallback = require("../callbacks/requestCallback");

//Create table interests
router.get('/create/interests', function(req, res) {
  QueryHelper.createInterestsTable(req,res);
});

router.get('/create/users_interests', function(req, res) {
  QueryHelper.createUsersInterestsTable(req,res);
});

router.get('/create/users', function(req, res) {
  QueryHelper.createUsersTable(req,res);
});

// Listado de usuarios
router.get('/', function(req, res) {

  Query.processQuery(req,res,new RequestCallback(req,res,Query.getUsers));

});

// Alta de usuario
router.post('/', function(req, res) {

  Query.processQuery(req,res,new RequestCallback(req,res,Query.addUser));

});

// Consulta perfil usuario
router.get('/[0-9]+', function(req, res) {

  Query.processQuery(req,res,new RequestCallback(req,res,Query.getSpecificUser));

});

// Modificacion de usuario
router.put('/[0-9]+', function(req, res) {

  Query.processQuery(req,res,new RequestCallback(req,res,Query.modifyUser));

});

// Eliminacion de usuario
router.delete('/[0-9]+', function(req, res) {

  Query.processQuery(req,res,new RequestCallback(req,res,Query.deleteUser));

});

//TODO::PASAR EL PROCESO DEL QUERY A LA CLASE QUERY
// Actualizar foto de perfil de usuario
router.put('/[0-9]+/photo', function(req, res) {
  fs.readFile(req.files.image.path, function (err, data) {
    var imageName = req.files.image.name;
    // If there's an error
    if(!imageName){
      console.log("There was an error");
      res.redirect("/");
      res.end();
    } else {
      var newPath = __dirname + "/uploads/fullsize/" + imageName;
      // write file to uploads/fullsize folder
      fs.writeFile(newPath, data, function (err) {
        // let's see it
        res.redirect("/uploads/fullsize/" + imageName);
      });
    }
  });
});

module.exports = router;
