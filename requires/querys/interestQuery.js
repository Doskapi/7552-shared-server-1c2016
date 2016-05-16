/* InterestQuery.js */

/* Clase encargada de:
  -> Procesar querys relacionadas a intereses */

var QueryHelper = require('./helpers/queryHelper');
var cStatus = require('../../constants/cStatus');

var InterestQuery = {};

// ALTA DE INTERES
InterestQuery.addInterest = function(client,done,req,res){
  var interest = req.body.interest;

  console.log(interest);

  client.query("SELECT * FROM interests WHERE category=($1) AND value=($2)",[interest.category,interest.value],function(err, result) {
    if(err) return QueryHelper.sendError(err,res,done,cStatus.ERROR);

    //TODO::VER QUE ENVIO SI YA EXISTE EL INTERES
    if(QueryHelper.hasResult(result)) return QueryHelper.sendError(err,res,done,cStatus.ERROR);

    client.query("INSERT INTO interests(category,value) values($1,$2)",[interest.category,interest.value],function(err, result) {
      if(err) return QueryHelper.sendError(err,res,done,cStatus.ERROR);
      done();

      //ENVIO 200 CONFIRMANDO AGREGADO DE INTERES SATISFACTORIO
      return res.status(cStatus.OK).json();
    });
  });
};

// OBTENCION DE TODOS LOS INTERESES
InterestQuery.getInterests = function(client,done,req,res){
  // Obtengo todos las filas de ta tabla intereses
  var query = client.query("SELECT * FROM interests ORDER BY id_interest ASC");

  // Agrego al array los intereses, uno por uno
  var results = [];
  query.on('row', function(row) {
    results.push(row);
  });

  // una vez que obtuve todos, los envio
  query.on('end', function() {
    done();
    return res.json(results);
  });
};

module.exports = InterestQuery;
