/* Users.js */

/* Clase encargada de procesar las request de la ruta /users/* */

var express = require('express');
var router = express.Router();
var QueryHelper = require('./querys/helpers/queryHelper');
var BaseQuery = require('./querys/baseQuery');
var UserQuery = require('./querys/userQuery');

// Crear tabla de intereses
router.get('/create/interests', function(req, res) {
  QueryHelper.createInterestsTable(req,res);
});

// Creat tabla usuario-intereses
router.get('/create/users_interests', function(req, res) {
  QueryHelper.createUsersInterestsTable(req,res);
});

// Crear tabla usuarios
router.get('/create/users', function(req, res) {
  QueryHelper.createUsersTable(req,res);
});

// Listado de usuarios
router.get('/', function(req, res) {

  BaseQuery.processQuery(req,res,UserQuery.getUsers);

});

// Alta de usuario
router.post('/', function(req, res) {

  BaseQuery.processQuery(req,res,UserQuery.addUser);

});

// Consulta perfil usuario
router.get('/[0-9]+', function(req, res) {

  BaseQuery.processQuery(req,res,UserQuery.getSpecificUser);

});

// Modificacion de usuario
router.put('/[0-9]+', function(req, res) {

  BaseQuery.processQuery(req,res,UserQuery.modifyUser);

});

// Eliminacion de usuario
router.delete('/[0-9]+', function(req, res) {

  BaseQuery.processQuery(req,res,UserQuery.deleteUser);

});

// Actualizar foto de perfil de usuario
router.put('/[0-9]+/photo', function(req, res) {
  BaseQuery.processQuery(req,res,UserQuery.updateUserPhoto);
});

module.exports = router;
