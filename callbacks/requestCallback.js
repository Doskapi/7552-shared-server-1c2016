var BaseCallback = require('./baseCallback');

function RequestCallback(req,res,resolver){
  BaseCallback.call(this);
  this.req = req;
  this.res = res;
  this.resolver = resolver;
  this.client = undefined;
  this.done = undefined;
}

RequestCallback.prototype = new BaseCallback();
RequestCallback.prototype.constructor = RequestCallback;

RequestCallback.prototype.setClientAndDone = function(client,done){
  this.client = client;
  this.done = done;
};

RequestCallback.prototype.execute = function(){
  this.resolver(this.client,this.done,this.req,this.res);
};

module.exports = RequestCallback;
