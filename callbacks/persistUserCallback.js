var BaseCallback = require('./baseCallback');

function PersistUserCallback(user,client,res,done,resolver){
  BaseCallback.call(this);
  this.user = user;
  this.resolver = resolver;
  this.client = client;
  this.res = res;
  this.done = done;
}

PersistUserCallback.prototype = new BaseCallback();
PersistUserCallback.prototype.constructor = PersistUserCallback;

PersistUserCallback.prototype.execute = function(){
  this.resolver(this.user,this.client,this.res,this.done);
};

module.exports = PersistUserCallback;
