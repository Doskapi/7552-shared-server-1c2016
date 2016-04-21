var express = require('express');
var router = express.Router();
var pg = require('pg');
var fs = require("fs");
var connectionString = "postgres://cwgmtezfmjyhao:b2edZkeC-qOcBcCHve8lXbKjeH@ec2-50-16-238-141.compute-1.amazonaws.com:5432/dbcqo9cuetdea3?ssl=true";
var QueryHelper = require('../helpers/queryHelper');
var Query = require('./query');
var ModifyUserCallback = require("../callbacks/modifyUserCallback");
var PersistUserCallback = require("../callbacks/persistUserCallback");

//Create table interests
router.get('/create/interests', function(req, res) {
  var client = new pg.Client(connectionString);
  client.connect();
  var query = client.query('CREATE TABLE interests(id_interest SERIAL PRIMARY KEY, category text, value text)');
  query.on('end', function() { client.end(); });

});

router.get('/create/users_interests', function(req, res) {
  var client = new pg.Client(connectionString);
  client.connect();
  var query = client.query('CREATE TABLE users_interests(id SERIAL PRIMARY KEY,id_user integer REFERENCES users(id_user) ON DELETE CASCADE,category text, value text)');
  query.on('end', function() { client.end(); });

});

router.get('/create/users', function(req, res) {
  var client = new pg.Client(connectionString);
  client.connect();
  var query = client.query('CREATE TABLE users(id_user SERIAL PRIMARY KEY, name text, alias text, sex text, photo text, email text,location json)');
  query.on('end', function() { client.end(); });
});

// Listado de usuarios
router.get('/', function(req, res) {

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {

    // Handle connection errors
    QueryHelper.controlError(err,res);

    // Obtengo todos las filas de ta tabla users, los usuarios
    var query = client.query("SELECT * FROM users INNER JOIN users_interests ON (users.id_user = users_interests.id_user) ORDER BY id ASC");

    // Agrego al array los usuarios, uno por uno
    var results = {users:[]};
    var user;
    var idUser;
    query.on('row', function(row) {
      console.log(row);
      if(idUser != row.id_user){
        idUser = row.id_user;
        user = {user: {id: undefined,name: undefined,alias:undefined,email:undefined,photo:undefined,sex:undefined,interests:[]}};
        user.user.id=row.id_user;
        user.user.name = row.name;
        user.user.alias = row.alias;
        user.user.email = row.email;
        user.user.sex = row.sex;
        user.user.photo = row.photo;
        user.user.location = row.location;
        user.user.interests.push({category:row.category,value:row.value});
        results.users.push(user);
      }else user.user.interests.push({category:row.category,value:row.value});
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      console.log(results);
      return res.json(results);
    });


  });

});

// Alta de usuario
router.post('/', function(req, res) {

  console.log("LLEGOOOO");
  console.log(req.body);

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {

    // Handle connection errors
    QueryHelper.controlError(err,res);

    // SQL Query > Insert Data
    client.query("SELECT * FROM users WHERE email LIKE '%"+req.body.user.email+"%'",function(err,result){
      if (err) {
        console.log("ERROR");
        console.log(err);
      } else if(!QueryHelper.hasResult(result)){
        if(QueryHelper.validatePersonalUserData(req.body.user)){
          //CHEQUEO INTERESES Y LUEGO PERSISTO
          Query.checkInterests(req.body.user,client,res,new PersistUserCallback(req.body.user,client,res,Query.persistUser));
        }
      }else{
        //TODO::ACLARAR CON EZE QUE DEVOLVERLE SI YA EXISTE ESE MAIL
        res.status(201).json(req.body.user);
      }

    });

  });

});

// Consulta perfil usuario
router.get('/[0-9]+', function(req, res) {

  //Obtengo id de la ruta
  var id = req.url.substring(1);

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {

    // Handle connection errors
    QueryHelper.controlError(err,res);

    // Obtengo todos las filas de ta tabla users, los usuarios
    var query = client.query("SELECT * FROM users INNER JOIN users_interests ON (users.id_user = users_interests.id_user) WHERE users.id_user ="+id);

    // Agrego al array los usuarios, uno por uno
    var user = {user: {id: undefined,name: undefined,alias:undefined,email:undefined,photo:undefined,sex:undefined,interests:[]}};

    query.on('row', function(row) {
      if(user.user.id === undefined){
        user.user.id=row.id_user;
        user.user.name = row.name;
        user.user.alias = row.alias;
        user.user.email = row.email;
        user.user.sex = row.sex;
        user.user.photo = row.photo;
        user.user.location = row.location;
      }
      user.user.interests.push({category:row.category,value:row.value});
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return res.json(user);
    });


  });

});

// Modificacion de usuario
router.put('/[0-9]+', function(req, res) {
  console.log("paso");
  //Obtengo id de la ruta
  var id = req.url.substring(1);

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {

    // Handle connection errors
    QueryHelper.controlError(err,res);

    // SQL Query > Insert Data
    client.query("SELECT * FROM users WHERE id_user ="+id,function(err,result){
      if (err) {
        console.log(err);
      } else if(QueryHelper.hasResult(result)){
        if(QueryHelper.validatePersonalUserData(req.body.user)){
          //CHEQUEO INTERESES Y LUEGO PERSISTO
          Query.checkInterests(req.body.user,client,res,new ModifyUserCallback(req.body.user,id,client,res,Query.modifyUser));
        }
      }else{
        //TODO:: VER QUE SE ENVIA DE ERROR
        res.status(500).json({ success: false, data: err});
      }
    });
  });

});

// Eliminacion de usuario
router.delete('/[0-9]+', function(req, res) {

  //Obtengo id de la ruta
  var id = req.url.substring(1);

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {

    // Handle connection errors
    QueryHelper.controlError(err,res);

    // SQL Query > Delete user
    QueryHelper.deleteUser(client,id,res);

  });

});

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
