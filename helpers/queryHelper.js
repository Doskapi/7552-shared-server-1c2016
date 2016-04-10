var QueryHelper = {
};

QueryHelper.hasResult = function(result){
  return result.rows.length > 0;
};

QueryHelper.validatePersonalUserData = function(user){
  return (user.name !== undefined && user.alias !== undefined &&
    user.email !== undefined && user.interests !== undefined && user.location !== undefined);
};

module.exports = QueryHelper;
