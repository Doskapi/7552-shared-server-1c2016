var BaseCallback = require('./baseCallback');

function ModifyUserCallback(user,idUser,client,res,resolver){
  BaseCallback.call(this);
  this.idUser = idUser;
  this.user = user;
  this.resolver = resolver;
  this.client = client;
  this.res = res;
}

ModifyUserCallback.prototype = new BaseCallback();
ModifyUserCallback.prototype.constructor = ModifyUserCallback;

ModifyUserCallback.prototype.execute = function(){
  this.resolver(this.user,this.idUser,this.client,this.res);
};

module.exports = ModifyUserCallback;
