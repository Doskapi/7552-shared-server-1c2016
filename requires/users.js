var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = "postgres://cwgmtezfmjyhao:b2edZkeC-qOcBcCHve8lXbKjeH@ec2-50-16-238-141.compute-1.amazonaws.com:5432/dbcqo9cuetdea3?ssl=true";

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
  //TODO:: NO BORRAR CON ESTO CREO LA TABLA
  // var client = new pg.Client(connectionString);
  // client.connect();
  // var query = client.query('CREATE TABLE users(id SERIAL PRIMARY KEY, data json)');
  // query.on('end', function() { client.end(); });

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {

    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err});
    }

    // SQL Query > Insert Data
    client.query("INSERT INTO users(data) values($1)",[req.body.user]);

  });

});

// Consulta perfil usuario
router.get('/id', function(req, res) {
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err});
    }
    // Obtengo todos las filas de ta tabla users, los usuarios
    var query = client.query("SELECT * FROM users WHERE id ="+req.query.id);

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

module.exports = router;
