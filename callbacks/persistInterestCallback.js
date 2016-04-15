var BaseCallback = require('./baseCallback');

function PersistInterestCallback(interest,idUser,client,res,resolver){
  BaseCallback.call(this);
  this.interest = interest;
  this.idUser = idUser;
  this.resolver = resolver;
  this.client = client;
  this.res = res;
  this.callback = undefined;
}

PersistInterestCallback.prototype = new BaseCallback();
PersistInterestCallback.prototype.constructor = PersistInterestCallback;

PersistInterestCallback.prototype.execute = function(){
  this.resolver(this.interest,this.idUser,this.client,this.res,this.callback);
};

PersistInterestCallback.prototype.setCallback = function(callback){
  this.callback = callback;
};

module.exports = PersistInterestCallback;
