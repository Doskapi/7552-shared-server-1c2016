var CheckInterestCallback = require('../callbacks/checkInterestCallback');
var PersistInterestCallback = require('../callbacks/persistInterestCallback');
var ResponseCallback = require('../callbacks/responseCallback');
var ModifyUserCallback = require("../callbacks/modifyUserCallback");
var PersistUserCallback = require("../callbacks/persistUserCallback");

var QueryHelper = require('../helpers/queryHelper');
var pg = require('pg');
var connectionString = "postgres://cwgmtezfmjyhao:b2edZkeC-qOcBcCHve8lXbKjeH@ec2-50-16-238-141.compute-1.amazonaws.com:5432/dbcqo9cuetdea3?ssl=true";

var Query = {};

Query.checkSpecificInterest = function(interest,client,res,done,callback){
  client.query("SELECT * FROM interests WHERE category  LIKE '%"+interest.category+"%'",function(err, result) {
    if(err) return QueryHelper.sendError(err,res,done,500);
    if(!QueryHelper.hasResult(result)) return QueryHelper.sendError(err,res,done,500);

    client.query("SELECT value FROM interests WHERE category = ($1) AND value = ($2)",[interest.category,interest.value],function(err, result) {
      if(err) return QueryHelper.sendError(err,res,done,500);
      if(!QueryHelper.hasResult(result)) return QueryHelper.sendError(err,res,done,500);
      callback.execute();
    });
  });
};

Query.persistUser = function(user,client,res,done){
  user.photo = "no_photo";
  client.query("INSERT INTO users(name,alias,sex,photo,email,location) values($1,$2,$3,$4,$5,$6) RETURNING id_user",[user.name,user.alias,user.sex,user.photo,user.email,user.location],function(err, result) {
    if(err) return QueryHelper.sendError(err,res,done,500);
    user.id = result.rows[0].id_user;
    Query.persistInterestAndResponse(user,user.id,client,res,done);
  });
};

Query.persistInterest = function(interest,idUser,client,res,done,callback){
  client.query("INSERT INTO users_interests(id_user,category,value) values($1,$2,$3)",[idUser,interest.category,interest.value],function(err, result) {
    if(err) return QueryHelper.sendError(err,res,done,500);
    callback.execute();
  });
};

Query.responseUser = function(user,res,done){
  done();
  return res.status(201).json(user);
};

Query.persistInterestAndResponse = function(user,idUser,client,res,done){
  var interests = user.interests;
  var callbacks = [];

  for(var i in interests){
    callbacks.push(new PersistInterestCallback(interests[i],idUser,client,res,done,Query.persistInterest));
  }
  for(i =0; i < callbacks.length-1;++i){
    callbacks[i].setCallback(callbacks[i+1]);
  }

  callbacks[callbacks.length-1].setCallback(new ResponseCallback(user,res,done,Query.responseUser));
  callbacks[0].execute();
};

Query.deleteInterestsAndResponse = function(user,idUser,client,res,done){
  client.query("DELETE FROM users_interests WHERE id_user="+idUser,function(err, result) {
    if(err) return QueryHelper.sendError(err,res,done,500);
    Query.persistInterestAndResponse(user,idUser,client,res,done);
  });
};

Query.modifyUserAndResponse = function(user,idUser,client,res,done){
  client.query("UPDATE users SET name=($1), alias=($2) WHERE id_user=($3)", [user.name,user.alias, idUser],function(err, result) {
    if(err) return QueryHelper.sendError(err,res,done,500);
    Query.deleteInterestsAndResponse(user,idUser,client,res,done);
  });
};

Query.checkInterests = function(user,client,res,done,next){
  var interests = user.interests;
  var callbacks = [];

  for(var i in interests){
    callbacks.push(new CheckInterestCallback(interests[i],client,res,done,Query.checkSpecificInterest));
  }

  for(i =0; i < callbacks.length-1;++i){
    callbacks[i].setCallback(callbacks[i+1]);
  }

  callbacks[callbacks.length-1].setCallback(next);
  callbacks[0].execute();
};




Query.deleteUser = function(client,done,req,res){

  //Obtengo id de la ruta
  var id = req.url.substring(1);

  // SQL Query > Delete user
  client.query("DELETE FROM users WHERE id_user="+id,function(err, result) {
    if(err) return QueryHelper.sendError(err,res,done,500);
    done();
    //TODO:: VER QUE SE DEVUELVE EN EL DELETE
    return res.status(200);
  });

};

Query.addUser = function(client,done,req,res){

  console.log(req.body);
  var user = JSON.parse(req.body).user;

  // console.log(user);

  // SQL Query > Insert Data
  client.query("SELECT * FROM users WHERE email LIKE '%"+user.email+"%'",function(err,result){
    if(err) return QueryHelper.sendError(err,res,done,500);
    if(QueryHelper.hasResult(result)) return QueryHelper.sendError(err,res,done,500);
    //TODO:: VER QUE DEVUELVO SI HAY UN CAMPO INVALIDO
    if(!QueryHelper.validatePersonalUserData(user)) return QueryHelper.sendError(err,res,done,500);
    //CHEQUEO INTERESES Y LUEGO PERSISTO
    Query.checkInterests(user,client,res,done,new PersistUserCallback(user,client,res,done,Query.persistUser));
  });

};

Query.getUsers = function(client,done,req,res){

  // Obtengo todos las filas de ta tabla users, los usuarios
  var query = client.query("SELECT * FROM users INNER JOIN users_interests ON (users.id_user = users_interests.id_user) ORDER BY id ASC");

  // Agrego al array los usuarios, uno por uno
  var results = {users:[]};
  var user;
  var idUser;
  query.on('row', function(row) {
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
    return res.json(results);
  });
};

Query.getSpecificUser = function(client,done,req,res){

  // //Obtengo id de la ruta
  var id = req.url.substring(1);

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

};

Query.modifyUser = function(client,done,req,res){

  //Obtengo id de la ruta
  var id = req.url.substring(1);

  var user = JSON.parse(req.body).user;

  console.log(user);

  // SQL Query > Insert Data
  var query = client.query("SELECT * FROM users WHERE id_user ="+id,function(err,result){
    if(err) return QueryHelper.sendError(err,res,done,500);
    if(!QueryHelper.hasResult(result)) return QueryHelper.sendError(err,res,done,500);
    //TODO:: VER QUE DEVUELVO SI HAY UN CAMPO INVALIDO
    if(!QueryHelper.validatePersonalUserData(user)) return QueryHelper.sendError(err,res,done,500);
    //CHEQUEO INTERESES Y LUEGO PERSISTO
    Query.checkInterests(user,client,res,done,new ModifyUserCallback(user,id,client,res,done,Query.modifyUserAndResponse));
  });

};

Query.addInterest = function(client,done,req,res){
  var interest = JSON.parse(req.body).interest;

  console.log(interest);

  client.query("SELECT * FROM interests WHERE category=($1) AND value=($2)",[interest.category,interest.value],function(err, result) {
    if(err) return QueryHelper.sendError(err,res,done,500);
    //TODO::VER QUE ENVIO SI YA EXISTE EL INTERES
    if(QueryHelper.hasResult(result)) return QueryHelper.sendError(err,res,done,500);

    client.query("INSERT INTO interests(category,value) values($1,$2)",[interest.category,interest.value],function(err, result) {
      if(err) return QueryHelper.sendError(err,res,done,500);
      done();
      //TODO:: VER QUE LE ENVIO CUANDO AGREGO SATISFACTORIAMENTE EL NUEVO INTERES
    });
  });
};

Query.getInterests = function(client,done,req,res){
  // Obtengo todos las filas de ta tabla users, los usuarios
  var query = client.query("SELECT * FROM interests ORDER BY id_interest ASC");

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
};

Query.processQuery = function(req,res,resolver){
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {

    // Handle connection errors
    if(err) QueryHelper.sendError(err,res,done,500);

    resolver.setClientAndDone(client,done);

    resolver.execute();
  });

};

module.exports = Query;
