/* UserQuery.js */

/* Clase encargada de:
  -> Procesar querys relacionadas a usuarios */

var QueryHelper = require('./helpers/queryHelper');
var cStatus = require('../../constants/cStatus');
var PersistUserCallback = require('./callbacks/persistUserCallback');
var ModifyUserCallback = require("./callbacks/modifyUserCallback");

var UserQuery = {};

// CHEQUEO UN INTERES ESPECIFICO
UserQuery.checkSpecificInterest = function(interest,client,res,done,callback){

  client.query("SELECT * FROM interests WHERE category LIKE '%"+interest.category+"%'",function(err, result) {
    if(err) return QueryHelper.sendError(err,res,done,cStatus.ERROR);
    if(!QueryHelper.hasResult(result)) return QueryHelper.sendError(err,res,done,cStatus.ERROR);

    client.query("SELECT value FROM interests WHERE category = ($1) AND value = ($2)",[interest.category,interest.value],function(err, result) {
      if(err) return QueryHelper.sendError(err,res,done,cStatus.ERROR);
      if(!QueryHelper.hasResult(result)) {
        client.query("INSERT INTO interests(category,value) values($1,$2)",[interest.category,interest.value],function(err, result) {
          if(err) return QueryHelper.sendError(err,res,done,cStatus.ERROR);
          callback.execute();
        });
      }else callback.execute();
    });
  });
};


// PERSISTO EL USUARIO EN LA TABLA
UserQuery.persistUser = function(user,client,res,done){
  client.query("INSERT INTO users(id,name,alias,sex,age,photo,email,location) values(0,$1,$2,$3,$4,$5,$6,$7) RETURNING id_user",[user.name,user.alias,user.sex,user.age,user.photo_profile,user.email,user.location],function(err, result) {

    if(err) return QueryHelper.sendError(err,res,done,cStatus.ERROR);

    user.id = result.rows[0].id_user;

    client.query("UPDATE users SET id=($1) WHERE id_user=($2)", [user.id,user.id],function(err, result) {

      if(err) return QueryHelper.sendError(err,res,done,cStatus.ERROR);

      //MANDO STATUS 201 DEL ADD USER
      QueryHelper.persistInterestAndResponse(user,user.id,client,res,done,201,UserQuery.persistInterest,UserQuery.responseUser);

    });
  });
};

// PERSISTO EL INTERES ESPECIFICO EN LA TABLA USUARIO-INTERESES
UserQuery.persistInterest = function(interest,idUser,client,res,done,callback){
  client.query("INSERT INTO users_interests(id_user,category,value) values($1,$2,$3)",[idUser,interest.category,interest.value],function(err, result) {
    if(err) return QueryHelper.sendError(err,res,done,cStatus.ERROR);
    callback.execute();
  });
};

// ENVIO RESPUESTA AL USUARIO QUE SOLICITO LA REQUEST
UserQuery.responseUser = function(user,res,done,statusOk){
  done();
  var result = {user:user};
  QueryHelper.addMetadata(result);
  return res.status(statusOk).json(result);
};


// ELIMINO LOS INTERESES DE UN USUARIO ESPECIFICO Y ENVIO RESPUESTA AL USUARIO
UserQuery.deleteInterestsAndResponse = function(user,idUser,client,res,done){
  client.query("DELETE FROM users_interests WHERE id_user="+idUser,function(err, result) {

    if(err) return QueryHelper.sendError(err,res,done,cStatus.ERROR);

    //MANDO STATUS 200 DEL MODIFY USER
    QueryHelper.persistInterestAndResponse(user,idUser,client,res,done,cStatus.OK,UserQuery.persistInterest,UserQuery.responseUser);
  });
};

// MODIFICO EL USUARIO ESPECIFICO Y ENVIO RESPUESTA AL USUARIO
UserQuery.modifyUserAndResponse = function(user,idUser,client,res,done){
  client.query("UPDATE users SET name=($1), alias=($2), age=($3),photo=($4)  WHERE users.id=($5)", [user.name,user.alias,user.age,user.photo_profile,idUser],function(err, result) {

    if(err) return QueryHelper.sendError(err,res,done,cStatus.ERROR);

    UserQuery.deleteInterestsAndResponse(user,idUser,client,res,done);
  });
};

// BAJA DE USUARIO ESPECIFICO
UserQuery.deleteUser = function(client,done,req,res){

  //OBTENGO ID DE LA RUTA
  var id = req.url.substring(1);

  // SQL QUERY -> ELIMINACION DE USUARIO ESPECIFICO
  client.query("DELETE FROM users WHERE id="+id,function(err, result) {

    if(err) return QueryHelper.sendError(err,res,done,cStatus.ERROR);

    //DEVUELVO 404 SI EL USUARIO SOLICITADO NO EXISTE
    if(!QueryHelper.hasDeleteUser(result.rowCount)) return res.status(cStatus.DONT_EXIST).json({msg:"User with id: "+id+" dont exist"});

    done();
    //DEVUELVO 200 INFORMANDO DELETE SATISFACTORIO
    return res.status(cStatus.OK).json({msg:"Delete user succesfully"});
  });

};

// ALTA DE USUARIO ESPECIFICO
UserQuery.addUser = function(client,done,req,res){

  var user = req.body.user;

  console.log(user.email);
  
  //PASO DATOS COMPARABLES A LOWERCASE
  QueryHelper.getLowerCaseUser(user);

  // SQL QUERY > ALTA USUARIO
  client.query("SELECT * FROM users WHERE email LIKE '%"+user.email+"%'",function(err,result){

    if(err) return QueryHelper.sendError(err,res,done,cStatus.ERROR);

    //DEVUELVO 500 SI EL MAIL YA ESTA EN USO
    if(QueryHelper.hasResult(result)) return res.status(cStatus.ERROR).json({msg:"Email already exist"});

    //DEVUELVO 400 SI FALTA ALGUN CAMPO
    if(!QueryHelper.validatePersonalUserData(user)) return res.status(cStatus.MISS_FIELD).json({msg:"Falta algun campo por completar"});

    //CHEQUEO INTERESES Y LUEGO PERSISTO
    QueryHelper.checkInterests(user,client,res,done,UserQuery.checkSpecificInterest,new PersistUserCallback(user,client,res,done,UserQuery.persistUser));
  });

};

// OBTENCION DE TODOS LOS USUARIOS
UserQuery.getUsers = function(client,done,req,res){

  // Obtengo todos las filas de ta tabla users, los usuarios
  var query = client.query("SELECT * FROM users LEFT JOIN users_interests ON (users.id_user = users_interests.id_user) ORDER BY users.id_user ASC");

  // Agrego al array los usuarios, uno por uno
  var results = {users:[]};
  var user;
  var id;
  query.on('row', function(row) {
    if(id != row.id){
      id = row.id;
      user = {user: {id: undefined,name: undefined,alias:undefined,email:undefined,photo:undefined,sex:undefined,interests:[]}};
      user.user.id=row.id;
      user.user.name = row.name;
      user.user.alias = row.alias;
      user.user.email = row.email;
      user.user.sex = row.sex;
      user.user.age = row.age;
      user.user.photo_profile = "https://shared-server.herokuapp.com/users/"+user.user.id+"/photo";
      user.user.location = row.location;
      if(row.category !== null) user.user.interests.push({category:row.category,value:row.value});
      results.users.push(user);
    }else if(row.category !== null) user.user.interests.push({category:row.category,value:row.value});
  // }
  });

  // LUEGO DE QUE TODA LA DATA ES DEVUELTA, CIERRO LA CONECCION Y ENVIO RESULTADOS
  query.on('end', function() {
    done();
    QueryHelper.addMetadataWithCount(results,results.users.length);
    return res.status(cStatus.OK).json(results);
  });
};

UserQuery.getUserPhoto = function(client,done,req,res){

  //Obtengo id de la ruta
  var id = QueryHelper.getIdFromPhotoRequest(req.url);
  console.log("id: "+id);

  // Obtengo todos las filas de ta tabla users, los usuarios
  var query = client.query("SELECT * FROM users WHERE users.id_user ="+id,function(err,result){
    if(err) return QueryHelper.sendError(err,res,done,cStatus.ERROR);

    //DEVUELVO 404 SI EL USUARIO SOLICITADO NO EXISTE
    if(!QueryHelper.hasResult(result)) return res.status(cStatus.DONT_EXIST).json({msg:"User with id: "+id+" dont exist"});

    // CARGO LA DATA
    var data = {photo: result.rows[0].photo};

    // CIERRO LA CONECCION
    done();

    // ENVIO RESULTADOS
    return res.status(cStatus.OK).json(data);
  });

};

UserQuery.getSpecificUser = function(client,done,req,res){

  // //Obtengo id de la ruta
  var id = req.url.substring(1);

  // Obtengo todos las filas de ta tabla users, los usuarios
  var query = client.query("SELECT * FROM users LEFT JOIN users_interests ON (users.id_user = users_interests.id_user) WHERE users.id ="+id,function(err,result){
    if(err) return QueryHelper.sendError(err,res,done,cStatus.ERROR);

    //DEVUELVO 404 SI EL USUARIO SOLICITADO NO EXISTE
    if(!QueryHelper.hasResult(result)) return res.status(cStatus.DONT_EXIST).json({msg:"User with id: "+id+" dont exist"});

    //ARMO LA DATA
    var user = {};

    var userData;

    for(var i=0;i<result.rows.length;++i){
      console.log(result.rows[i]);
      userData = result.rows[i];
      if(i===0){
        user.id=userData.id;
        user.name = userData.name;
        user.alias = userData.alias;
        user.email = userData.email;
        user.sex = userData.sex;
        user.age = userData.age;
        user.photo_profile = userData.photo;
        user.location = userData.location;
        user.interests = [];
      }
      if(userData.category !== null) user.interests.push({category:userData.category,value:userData.value});
    }

    // CARGO LA DATA
    var data = {user: user};

    //LE AGREGO EL CAMPO METADATA
    QueryHelper.addMetadata(data);

    // CIERRO LA CONECCION
    done();

    // ENVIO RESULTADOS
    return res.status(cStatus.OK).json(data);
  });

};

// MODIFICACION DE USUARIO
UserQuery.modifyUser = function(client,done,req,res){

  //Obtengo id de la ruta
  var id = req.url.substring(1);

  var user = req.body.user;

  //PASO DATOS COMPARABLES A LOWERCASE
  QueryHelper.getLowerCaseUser(user);

  console.log(user.email);

  // SQL QUERY > MODFICACION DE USUARIO
  var query = client.query("SELECT * FROM users WHERE id_user ="+id,function(err,result){
    if(err) return QueryHelper.sendError(err,res,done,cStatus.ERROR);

    //DEVUELVO 404 SI EL USUARIO SOLICITADO NO EXISTE
    if(!QueryHelper.hasResult(result)) return res.status(cStatus.DONT_EXIST).json({msg:"User with id: "+id+" dont exist"});

    //DEVUELVO 400 SI FALTA ALGUN CAMPO
    if(!QueryHelper.validatePersonalUserData(user)) return res.status(cStatus.MISS_FIELD).json({msg:"Falta algun campo por completar"});

    //CHEQUEO INTERESES Y LUEGO PERSISTO
    QueryHelper.checkInterests(user,client,res,done,UserQuery.checkSpecificInterest,new ModifyUserCallback(user,id,client,res,done,UserQuery.modifyUserAndResponse));
  });

};

// MODIFICACION DE FOTO DE PERFIL DE USUARIO
UserQuery.updateUserPhoto = function(client,done,req,res){

  //Obtengo id de la ruta
  var id = QueryHelper.getIdFromPhotoRequest(req.url);
  console.log("id: "+id);

  var photo = req.body.photo;

  console.log(photo);

  // SQL QUERY > MODIFICACION DE FOTO DE PERFIL DE USUARIO
  var query = client.query("UPDATE users SET photo=($1) WHERE users.id=($2)", [photo, id],function(err,result){
    if(err) return QueryHelper.sendError(err,res,done,cStatus.ERROR);
    done();

    //ENVIO 200 CONFIRMANDO AGREGADO DE INTERES SATISFACTORIO
    return res.status(cStatus.OK).json();
  });

};

module.exports = UserQuery;
