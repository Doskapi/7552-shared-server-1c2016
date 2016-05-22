/* QueryHelper.js */

/* Clase estatica que se encarga de:
  -> Validacion de datos
  -> Envio de error
  -> Creacion de tablas
  -> Creacion de callbacks para el proceso de la query*/

var pg = require('pg');
var connectionString = "postgres://cwgmtezfmjyhao:b2edZkeC-qOcBcCHve8lXbKjeH@ec2-50-16-238-141.compute-1.amazonaws.com:5432/dbcqo9cuetdea3?ssl=true";

var CheckInterestCallback = require('../callbacks/checkInterestCallback');
var ResponseCallback = require('../callbacks/responseCallback');
var PersistInterestCallback = require('../callbacks/persistInterestCallback');

var QueryHelper = {};

//VERIFICA SI SE ENCONTRARON RESULTADOS
QueryHelper.hasResult = function(result){
  return result.rows.length > 0;
};

//VERIFICA SI SE ELIMINO EL USUARIO
QueryHelper.hasDeleteUser = function(count){
  return count > 0;
};

//DEVUELVE LA ID DE LA URL DE REQUEST DE FOTOS
QueryHelper.getIdFromPhotoRequest = function(url){
  url = url.substring(1);
  return url.substring(0,url.indexOf("/"));
};

//DEVUELVE EL VALUE EN LOWERCASE
QueryHelper.getLowerCase = function(value){
  return value.toLowerCase();
};

//VALIDA CAMPOS DE USUARIO
QueryHelper.validatePersonalUserData = function(user){
  return (user.name !== undefined &&
     user.alias !== undefined &&
      user.sex !== undefined &&
       user.email !== undefined &&
        user.interests !== undefined &&
         user.location !== undefined &&
          user.photo_profile !== undefined &&
          (user.sex == 'male' || user.sex == 'female'));
};

//ENVIO DE ERROR
QueryHelper.sendError = function(err,res,done,status){
  done();
  return res.status(status).json({ success: false, data: err});
};

//CREA TABLA DE USUARIOS
QueryHelper.createUsersTable = function(req,res){
  var client = new pg.Client(connectionString);
  client.connect();
  var query = client.query('CREATE TABLE users(id_user SERIAL PRIMARY KEY, name text, alias text, sex text, photo text, email text,location json)');
  query.on('end', function() { client.end(); });
};

//CREA TABLA DE VINCULACION USUARIO-INTERESES
QueryHelper.createUsersInterestsTable = function(req,res){
  var client = new pg.Client(connectionString);
  client.connect();
  var query = client.query('CREATE TABLE users_interests(id SERIAL PRIMARY KEY,id_user integer REFERENCES users(id_user) ON DELETE CASCADE,category text, value text)');
  query.on('end', function() { client.end(); });
};

//CREA TABLA DE INTERESES
QueryHelper.createInterestsTable = function(req,res){
  var client = new pg.Client(connectionString);
  client.connect();
  var query = client.query('CREATE TABLE interests(id_interest SERIAL PRIMARY KEY, category text, value text)');
  query.on('end', function() { client.end(); });
};

// METODO ENCARGADO DE CREAR LAS CALLBACKS DE PERSISTENCIA DE INTERESES Y RESPUESTA AL USUARIO
QueryHelper.persistInterestAndResponse = function(user,idUser,client,res,done,statusOk,next,lastNext){
  var interests = user.interests;
  var callbacks = [];

  if(interests.length > 0){

    for(var i in interests){
      callbacks.push(new PersistInterestCallback(interests[i],idUser,client,res,done,next));
    }

    for(i =0; i < callbacks.length-1;++i){
      callbacks[i].setCallback(callbacks[i+1]);
    }

    callbacks[callbacks.length-1].setCallback(new ResponseCallback(user,res,done,statusOk,lastNext));

  }else callbacks.push(new ResponseCallback(user,res,done,statusOk,lastNext));

  callbacks[0].execute();
};

// METODO ENCARGADO DE CREAR LAS CALLBACKS DE CHEQUEO DE INTERESES
QueryHelper.checkInterests = function(user,client,res,done,next,lastNext){
  var interests = user.interests;
  var callbacks = [];

  if(interests.length > 0){

    for(var i in interests){
      callbacks.push(new CheckInterestCallback(interests[i],client,res,done,next));
    }

    for(i =0; i < callbacks.length-1;++i){
      callbacks[i].setCallback(callbacks[i+1]);
    }

    callbacks[callbacks.length-1].setCallback(lastNext);

  }else callbacks.push(lastNext);

  callbacks[0].execute();
};

module.exports = QueryHelper;
