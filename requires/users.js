var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = "postgres://cwgmtezfmjyhao:b2edZkeC-qOcBcCHve8lXbKjeH@ec2-50-16-238-141.compute-1.amazonaws.com:5432/dbcqo9cuetdea3?ssl=true";

// middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   next();
// });

// var client = new pg.Client(connectionString);
// client.connect();
// var query = client.query('CREATE TABLE users(id SERIAL PRIMARY KEY, data json)');
// query.on('end', function() { client.end(); });

// GET USERS
router.get('/', function(req, res) {

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {
    // Handle connection errors
    var results = [];
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err});
    }



    // SQL Query > Insert Data
    // client.query("INSERT INTO users(id,data) values($1,$2)",
    //           [1,'{"id":1,"name":"seba","alias":"vica","email":"sef@gmail.com","photo_profile":"http://<sharedserver>/users/1/photo","interest":"[{category: music/band,value: tame impala},{category: outdoors,value: running}]","location":"{latitude:123,longitud:46}"}']);
    // client.query("INSERT INTO users(id,data) values($1,$2)",
    //             [2,'{"id":1,"name":"roberto","alias":"rober","email":"sasd@gmail.com","photo_profile":"http://<sharedserver>/users/2/photo","interest":"[{category: music/band,value: metallica}]","location":"{latitude:123,longitud:46}"}']);
    // client.query("INSERT INTO users(id,data) values($1,$2)",
    //             [3,'{"id":1,"name":"freddy","alias":"kruger","email":"asdf@gmail.com","photo_profile":"http://<sharedserver>/users/3/photo","interest":"[{category: outdoors,value: running}]","location":"{latitude:123,longitud:46}"}']);
    // SQL Query > Select Data
    var query = client.query("SELECT * FROM users ORDER BY id ASC");

    // Stream results back one row at a time
    query.on('row', function(row) {
      results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      console.log("LLEGO!");
      return res.json(results);
    });


  });

});

// POST USERS
router.post('/', function(req, res) {

  console.log(req.body);

  // var client = new pg.Client(connectionString);
  // client.connect();
  // var query = client.query('CREATE TABLE users(id SERIAL PRIMARY KEY, data json)');
  // query.on('end', function() { client.end(); });

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {
    // Handle connection errors
    var results = [];
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err});
    }

    // SQL Query > Insert Data
    client.query("INSERT INTO users(data) values($1)",[req.body.user]);

  });

});

module.exports = router;
