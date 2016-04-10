var CheckInterestCallback = require('../callbacks/checkInterestCallback');
var AddUserCallback = require('../callbacks/addUserCallback');
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

Query.addUser = function(user,client,res,req){
  client.query("INSERT INTO users(data) values($1) RETURNING id",[user],function(err, result) {
    if (err) {
      console.log(err);
    } else {
      req.body.user.id = result.rows[0].id;
      res.status(201).json(req.body.user);
    }
  });
};

Query.checkInterests = function(user,client,res,req){
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
  callbacks[callbacks.length-1].setCallback(new AddUserCallback(user,client,res,req,Query.addUser));
  callbacks[0].execute();
};

module.exports = Query;
