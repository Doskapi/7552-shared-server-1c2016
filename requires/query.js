var CheckInterestCallback = require('../callbacks/checkInterestCallback');
var PersistInterestCallback = require('../callbacks/persistInterestCallback');
var ResponseCallback = require('../callbacks/responseCallback');
var ModifyUserCallback = require("../callbacks/modifyUserCallback");
var PersistUserCallback = require("../callbacks/persistUserCallback");

var QueryHelper = require('../helpers/queryHelper');
var pg = require('pg');
var connectionString = "postgres://cwgmtezfmjyhao:b2edZkeC-qOcBcCHve8lXbKjeH@ec2-50-16-238-141.compute-1.amazonaws.com:5432/dbcqo9cuetdea3?ssl=true";

var Query = {};

Query.checkSpecificInterest = function(interest,client,res,callback){
  client.query("SELECT * FROM interests WHERE category  LIKE '%"+interest.category+"%'",function(err, result) {
    if (err) {
      console.log(err);
      //Contiene la categoria
    } else if(QueryHelper.hasResult(result)){
      client.query("SELECT value FROM interests WHERE category = ($1) AND value = ($2)",[interest.category,interest.value],function(err, result) {
        if (err) {
          console.log(err);
          //Contiene la categoria y valor
        }else if(QueryHelper.hasResult(result)){
          callback.execute();
          //Contiene la categoria pero no el valor
        }else{
          client.query("INSERT INTO interests(category,value) values($1,$2)",[interest.category,interest.value],function(err, result) {
            if (err) {
              console.log(err);
            }else callback.execute();
          });
        }
      });
      //No contiene la categoria
    }else{
      res.status(404);
    }
  });
};

Query.persistUser = function(user,client,res){
  user.photo = "no_photo";
  client.query("INSERT INTO users(name,alias,sex,photo,email,location) values($1,$2,$3,$4,$5,$6) RETURNING id_user",[user.name,user.alias,user.sex,user.photo,user.email,user.location],function(err, result) {
    if (err) {
      console.log(err);
    } else {
      user.id = result.rows[0].id_user;
      Query.persistInterestAndResponse(user,user.id,client,res);
    }
  });
};

Query.persistInterest = function(interest,idUser,client,res,callback){
  client.query("INSERT INTO users_interests(id_user,category,value) values($1,$2,$3)",[idUser,interest.category,interest.value],function(err, result) {
    if (err) {
      console.log(err);
    } else {
      callback.execute();
    }
  });
};

Query.responseUser = function(user,res){
  res.status(201).json(user);
};

Query.persistInterestAndResponse = function(user,idUser,client,res){
  var interests = user.interests;
  var callbacks = [];
  // console.log("ResolverDBPlayer:: playersInfoArena lenght: "+playersInfoArena.length);
  for(var i in interests){
    callbacks.push(new PersistInterestCallback(interests[i],idUser,client,res,Query.persistInterest));
  }
  for(i =0; i < callbacks.length-1;++i){
    callbacks[i].setCallback(callbacks[i+1]);
  }
  // console.log("ResolverDBPlayer:: callbacks lenght: "+callbacks.length);
  callbacks[callbacks.length-1].setCallback(new ResponseCallback(user,res,Query.responseUser));
  callbacks[0].execute();
};

Query.deleteInterestsAndResponse = function(user,idUser,client,res){
  client.query("DELETE FROM users_interests WHERE id_user="+idUser,function(err, result) {
    if (err) {
      console.log(err);
    } else {
      Query.persistInterestAndResponse(user,idUser,client,res);
    }
  });
};

Query.modifyUserAndResponse = function(user,idUser,client,res){
  client.query("UPDATE users SET name=($1), alias=($2) WHERE id_user=($3)", [user.name,user.alias, idUser],function(err, result) {
    if (err) {
      console.log(err);
    } else {
      Query.deleteInterestsAndResponse(user,idUser,client,res);
    }
  });
};

Query.checkInterests = function(user,client,res,next){
  var interests = user.interests;
  var callbacks = [];
  // console.log("ResolverDBPlayer:: playersInfoArena lenght: "+playersInfoArena.length);
  for(var i in interests){
    callbacks.push(new CheckInterestCallback(interests[i],client,res,Query.checkSpecificInterest));
  }
  for(i =0; i < callbacks.length-1;++i){
    callbacks[i].setCallback(callbacks[i+1]);
  }
  // console.log("ResolverDBPlayer:: callbacks lenght: "+callbacks.length);
  callbacks[callbacks.length-1].setCallback(next);
  callbacks[0].execute();
};




Query.deleteUser = function(client,done,req,res){

  //Obtengo id de la ruta
  var id = req.url.substring(1);

  // SQL Query > Delete user
  client.query("DELETE FROM users WHERE id_user="+id,function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.status(200);
    }
  });

};

Query.addUser = function(client,done,req,res){

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

  // console.log(client);
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

  // SQL Query > Insert Data
  var query = client.query("SELECT * FROM users WHERE id_user ="+id,function(err,result){
    if (err) {
      console.log(err);
    } else if(QueryHelper.hasResult(result)){
      if(QueryHelper.validatePersonalUserData(req.body.user)){
        //CHEQUEO INTERESES Y LUEGO PERSISTO
        Query.checkInterests(req.body.user,client,res,new ModifyUserCallback(req.body.user,id,client,res,Query.modifyUserAndResponse));
      }
    }else{
      //TODO:: VER QUE SE ENVIA DE ERROR
      res.status(500).json({ success: false, data: err});
    }

  });

};

Query.addInterest = function(client,done,req,res){
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
};

Query.getInterests = function(client,done,req,res){
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
};

Query.processQuery = function(req,res,resolver){
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {

    // Handle connection errors
    QueryHelper.controlError(err,res);

    resolver.setClientAndDone(client,done);

    resolver.execute();
  });
  
};

module.exports = Query;
