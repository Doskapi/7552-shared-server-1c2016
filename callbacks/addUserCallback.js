var BaseCallback = require('./baseCallback');

function AddUserCallback(user,client,res,req,resolver){
  BaseCallback.call(this);
  this.user = user;
  this.resolver = resolver;
  this.client = client;
  this.res = res;
  this.req = req;
}

AddUserCallback.prototype = new BaseCallback();
AddUserCallback.prototype.constructor = AddUserCallback;

AddUserCallback.prototype.execute = function(){
  this.resolver(this.user,this.client,this.res,this.req);
};

module.exports = AddUserCallback;
