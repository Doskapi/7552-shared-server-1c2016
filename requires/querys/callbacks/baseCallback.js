function BaseCallback(){

}

BaseCallback.prototype.execute = function(){
  throw new Error("Cannot call abstract method bro");
};

module.exports = BaseCallback;
