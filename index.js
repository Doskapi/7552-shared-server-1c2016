var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var users = require('./requires/users');
var interests = require('./requires/interests');
var views = require('./requires/views');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/users', users);
app.use('/interests', interests);
app.use('/', views);

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function () {
  console.log('Example app listening on port 5000!');
});
