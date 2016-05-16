/* Query.js */

/* Clase encargada de:
  -> Obtener cliente postgres
  -> Delegar proceso de consulta solicitada en el resolver */

var cStatus = require('../../constants/cStatus');
var QueryHelper = require('./helpers/queryHelper');
var pg = require('pg');

var connectionString = "postgres://cwgmtezfmjyhao:b2edZkeC-qOcBcCHve8lXbKjeH@ec2-50-16-238-141.compute-1.amazonaws.com:5432/dbcqo9cuetdea3?ssl=true";

var BaseQuery = {};

// METODO ENCARGADO DE OBTENER UN CLIENTE DE POSTGRES Y DELEGAR EN RESOLVER EL PROCESO DE LA QUERY
BaseQuery.processQuery = function(req,res,resolver){

  // OBTENGO UN CLIENTE POSTGRES DE LA PILETA DE CONECCIONES
  pg.connect(connectionString, function(err, client, done) {

    // CHEQUEO ERROR EN LA OBTENCION DEL CLIENTE POSTGRES
    if(err) QueryHelper.sendError(err,res,done,cStatus.ERROR);

    resolver(client,done,req,res);
  });

};

module.exports = BaseQuery;
