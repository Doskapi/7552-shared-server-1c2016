var pg = require('pg');
var connectionString = "postgres://cwgmtezfmjyhao:b2edZkeC-qOcBcCHve8lXbKjeH@ec2-50-16-238-141.compute-1.amazonaws.com:5432/dbcqo9cuetdea3?ssl=true";


var QueryHelper = {
};

QueryHelper.hasResult = function(result){
  return result.rows.length > 0;
};

QueryHelper.validatePersonalUserData = function(user){
  return (user.name !== undefined && user.alias !== undefined && user.sex !== undefined && user.email !== undefined && user.interests !== undefined && user.location !== undefined && user.photo_profile !== undefined);
};

QueryHelper.sendError = function(err,res,done,status){
  done();
  return res.status(status).json({ success: false, data: err});
};

QueryHelper.createUsersTable = function(req,res){
  var client = new pg.Client(connectionString);
  client.connect();
  var query = client.query('CREATE TABLE users(id_user SERIAL PRIMARY KEY, name text, alias text, sex text, photo text, email text,location json)');
  query.on('end', function() { client.end(); });
};

QueryHelper.createUsersInterestsTable = function(req,res){
  var client = new pg.Client(connectionString);
  client.connect();
  var query = client.query('CREATE TABLE users_interests(id SERIAL PRIMARY KEY,id_user integer REFERENCES users(id_user) ON DELETE CASCADE,category text, value text)');
  query.on('end', function() { client.end(); });
};

QueryHelper.createInterestsTable = function(req,res){
  var client = new pg.Client(connectionString);
  client.connect();
  var query = client.query('CREATE TABLE interests(id_interest SERIAL PRIMARY KEY, category text, value text)');
  query.on('end', function() { client.end(); });
};

QueryHelper.hasUserInterest = function(user){
  return user.interests.length > 0;
};

module.exports = QueryHelper;
