var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = "postgres://cwgmtezfmjyhao:b2edZkeC-qOcBcCHve8lXbKjeH@ec2-50-16-238-141.compute-1.amazonaws.com:5432/dbcqo9cuetdea3?ssl=true";
var QueryHelper = require('../helpers/queryHelper');

// Alta de interest
router.post('/', function(req, res) {

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {

    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err});
    }
    var interest = req.body.interest;
    client.query("SELECT * FROM interests WHERE category=($1) AND value=($2)",[interest.category,interest.value],function(err, result) {
      if (err) {
        console.log(err);
        //Contiene la categoria y valor
      }else if(QueryHelper.hasResult(result)){
        //TODO:: INFORMARLE QUE EL INTEREST EXISTE
      }else{
        client.query("INSERT INTO interests(category,value) values($1,$2)",[interest.category,interest.value],function(err, result) {
          if (err) {
            console.log(err);
          }else{
              //TODO:: INFORMARLE QUE EL INTEREST FUE AGREGADO
          }
        });
      }
    });

  });

});

// Listado de interests
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
    var query = client.query("SELECT * FROM interests ORDER BY id ASC");

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
