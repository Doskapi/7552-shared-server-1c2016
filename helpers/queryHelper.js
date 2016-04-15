var QueryHelper = {
};

QueryHelper.hasResult = function(result){
  return result.rows.length > 0;
};

QueryHelper.validatePersonalUserData = function(user){
  return (user.name !== undefined && user.alias !== undefined &&
    user.email !== undefined && user.interests !== undefined && user.location !== undefined);
};

QueryHelper.deleteUser = function(client,id,res){
  client.query("DELETE FROM users WHERE id_user="+id,function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.status(200);
    }
  });
};

QueryHelper.controlError = function(err,res){
  if(err) {
    done();
    console.log(err);
    return res.status(500).json({ success: false, data: err});
  }
};

module.exports = QueryHelper;
