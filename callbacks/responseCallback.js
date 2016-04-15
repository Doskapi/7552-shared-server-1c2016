var BaseCallback = require('./baseCallback');

function ResponseCallback(user,res,resolver){
  BaseCallback.call(this);
  this.user = user;
  this.resolver = resolver;
  this.res = res;
}

ResponseCallback.prototype = new BaseCallback();
ResponseCallback.prototype.constructor = ResponseCallback;

ResponseCallback.prototype.execute = function(){
  this.resolver(this.user,this.res);
};

module.exports = ResponseCallback;
