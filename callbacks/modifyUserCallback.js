var BaseCallback = require('./baseCallback');

function ModifyUserCallback(user,idUser,client,res,done,resolver){
  BaseCallback.call(this);
  this.idUser = idUser;
  this.user = user;
  this.resolver = resolver;
  this.client = client;
  this.res = res;
  this.done = done;
}

ModifyUserCallback.prototype = new BaseCallback();
ModifyUserCallback.prototype.constructor = ModifyUserCallback;

ModifyUserCallback.prototype.execute = function(){
  this.resolver(this.user,this.idUser,this.client,this.res,this.done);
};

module.exports = ModifyUserCallback;
