var BaseCallback = require('./baseCallback');

function ResponseCallback(user,res,done,resolver){
  BaseCallback.call(this);
  this.user = user;
  this.resolver = resolver;
  this.res = res;
  this.done = done;
}

ResponseCallback.prototype = new BaseCallback();
ResponseCallback.prototype.constructor = ResponseCallback;

ResponseCallback.prototype.execute = function(){
  this.resolver(this.user,this.res,this.done);
};

module.exports = ResponseCallback;
