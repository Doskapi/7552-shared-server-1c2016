var CheckInterestCallback = require('../callbacks/checkInterestCallback');
var PersistInterestCallback = require('../callbacks/persistInterestCallback');
var ResponseCallback = require('../callbacks/responseCallback');
var QueryHelper = require('../helpers/queryHelper');

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

Query.modifyUser = function(user,idUser,client,res){
  console.log("PASO MODIFY");
  client.query("UPDATE users SET name=($1), alias=($2) WHERE id_user=($3)", [user.name,user.alias, idUser],function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("MODIFICO");
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

module.exports = Query;
