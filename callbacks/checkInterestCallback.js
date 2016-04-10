var BaseCallback = require('./baseCallback');

function CheckInterestCallback(interest,client,res,resolver){
  BaseCallback.call(this);
  this.interest = interest;
  this.resolver = resolver;
  this.client = client;
  this.res = res;
  this.callback = undefined;
}

CheckInterestCallback.prototype = new BaseCallback();
CheckInterestCallback.prototype.constructor = CheckInterestCallback;

CheckInterestCallback.prototype.execute = function(){
  this.resolver(this.interest,this.client,this.res,this.callback);
};

CheckInterestCallback.prototype.setCallback = function(callback){
  this.callback = callback;
};

module.exports = CheckInterestCallback;
