// var express = require('express');
// var app = express();
// var massive = require("massive");
// var connectionString = "postgres://cwgmtezfmjyhao:b2edZkeC-qOcBcCHve8lXbKjeH@ec2-50-16-238-141.compute-1.amazonaws.com:5432/dbcqo9cuetdea3?ssl=true";
//
// var massiveInstance = massive.connectSync({connectionString : connectionString});
//
// // Set a reference to the massive instance on Express' app:
// app.set('db', massiveInstance);
// app.set('port', (process.env.PORT || 5000));
//
//
// var db = app.get('db');
//
// app.get('/hola', function (req, res) {
//   // res.send('Hello World!');
//   db.users.findDoc({name: "Seba"},function(err,user){
//     if(err) console.log(err);
//     else if(user === null) console.log("user is null");
//     res.send("User name: "+user[0].name+" age: "+user[0].age);
//   });
// });
//
// db.users.findDoc({id:1},function(err,user){
//   if(err) console.log(err);
//   else if(user === null) console.log("user is null");
//   console.log(user.age);
// });
//
// app.listen(app.get('port'), function () {
//   console.log('Example app listening on port 5000!');
// });


var express = require('express');
var app = express();
var pg = require('pg');
var connectionString = "postgres://cwgmtezfmjyhao:b2edZkeC-qOcBcCHve8lXbKjeH@ec2-50-16-238-141.compute-1.amazonaws.com:5432/dbcqo9cuetdea3?ssl=true";

// Set a reference to the massive instance on Express' app:
app.set('port', (process.env.PORT || 5000));

// var client = new pg.Client(connectionString);
// client.connect();
// var query = client.query('CREATE TABLE items(id SERIAL PRIMARY KEY, text VARCHAR(40) not null, complete BOOLEAN)');
// query.on('end', function() { client.end(); });

app.get('/', function (req, res) {
  // res.send('Hello World!');

  var results = [];

  // Grab data from http request
  var data = {text: "Seba", complete: false};
  // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }



        // SQL Query > Insert Data
        client.query("INSERT INTO items(text, complete) values($1, $2)", [data.text,data.complete]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM items ORDER BY id ASC");

        // Stream results back one row at a time
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

app.listen(app.get('port'), function () {
  console.log('Example app listening on port 5000!');
});
