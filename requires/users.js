var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = "postgres://cwgmtezfmjyhao:b2edZkeC-qOcBcCHve8lXbKjeH@ec2-50-16-238-141.compute-1.amazonaws.com:5432/dbcqo9cuetdea3?ssl=true";
var QueryHelper = require('../helpers/queryHelper');
var Query = require('./query');

//Create table interests
router.get('/create/interests', function(req, res) {
  var client = new pg.Client(connectionString);
  client.connect();
  var query = client.query('CREATE TABLE interests(id SERIAL PRIMARY KEY, category text, value text)');
  query.on('end', function() { client.end(); });

});

router.get('/create/users', function(req, res) {
  var client = new pg.Client(connectionString);
  client.connect();
  var query = client.query('CREATE TABLE users(id SERIAL PRIMARY KEY, data json)');
  query.on('end', function() { client.end(); });
});

// Listado de usuarios
router.get('/', function(req, res) {

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err});
    }

    // Obtengo todos las filas de ta tabla users, los usuarios
    var query = client.query("SELECT * FROM users ORDER BY id ASC");

    // Agrego al array los usuarios, uno por uno
    var results = [];
    query.on('row', function(row) {
      results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return res.json(results);
    });


  });

});

// Alta de usuario
router.post('/', function(req, res) {
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {

    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err});
    }

    // SQL Query > Insert Data
    // client.query("SELECT * FROM users WHERE alias="+req.body.user.alias,function(err,result){
    //   if (err) {
    //     console.log("ERROR");
    //     console.log(err);
    //   } else if(!QueryHelper.hasResult(result)){
        if(QueryHelper.validatePersonalUserData(req.body.user)){
          Query.checkInterests(req.body.user,client,res,req);
        }
      // }else{
      //   res.status(201).json(req.body.user);
      // }

    // });

  });

});

// Consulta perfil usuario
router.get('/[0-9]+', function(req, res) {

  //Obtengo id de la ruta
  var id = req.url.substring(1);

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err});
    }
    // Obtengo todos las filas de ta tabla users, los usuarios
    var query = client.query("SELECT * FROM users WHERE id ="+id);

    // Agrego al array los usuarios, uno por uno
    var results = [];
    query.on('row', function(row) {
      results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return res.json(results);
    });


  });

});

// Modificacion de usuario
router.put('/[0-9]+', function(req, res) {

  //Obtengo id de la ruta
  var id = req.url.substring(1);

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {

    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err});
    }

    // SQL Query > Insert Data
    client.query("UPDATE users SET data=($1) WHERE id=($2)", [req.body.user, id],function(err, result) {
      if (err) {
        console.log(err);
      } else {
        res.status(200);
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
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err});
    }

    // SQL Query > Delete user
    client.query("DELETE FROM users WHERE id=($1)", [id],function(err, result) {
      if (err) {
        console.log(err);
      } else {
        res.status(200);
      }
    });

  });

});

module.exports = router;
