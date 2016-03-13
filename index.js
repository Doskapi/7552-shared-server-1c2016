var express = require('express');
var app = express();
var massive = require("massive");
var connectionString = "postgres://cwgmtezfmjyhao:b2edZkeC-qOcBcCHve8lXbKjeH@ec2-50-16-238-141.compute-1.amazonaws.com:5432/dbcqo9cuetdea3?ssl=true";

var massiveInstance = massive.connectSync({connectionString : connectionString});

// Set a reference to the massive instance on Express' app:
app.set('db', massiveInstance);
app.set('port', (process.env.PORT || 5000));


var db = app.get('db');

app.get('/', function (req, res) {
  // res.send('Hello World!');
  db.users.findDoc({name: "Seba"},function(err,user){
    if(err) console.log(err);
    else if(user === null) console.log("user is null");
    res.send("User name: "+user[0].name+" age: "+user[0].age);
  });
});

db.users.findDoc({id:1},function(err,user){
  if(err) console.log(err);
  else if(user === null) console.log("user is null");
  console.log(user.age);
});

app.listen(app.get('port'), function () {
  console.log('Example app listening on port 5000!');
});
