var BaseCallback = require('./baseCallback');

function ResponseCallback(user,res,done,statusOk,resolver){
  BaseCallback.call(this);
  this.user = user;
  this.resolver = resolver;
  this.res = res;
  this.done = done;
  this.statusOk = statusOk;
}

ResponseCallback.prototype = new BaseCallback();
ResponseCallback.prototype.constructor = ResponseCallback;

ResponseCallback.prototype.execute = function(){
  this.resolver(this.user,this.res,this.done,this.statusOk);
};

module.exports = ResponseCallback;
