/* Controller.js */

/* Clase que contiene los metodos de request solicitados por los distintos archivos de html */

var app = angular.module('MagicMatch', []);
app.controller('Controller', function($scope,$http) {

  //VARIABLES DE SCOPE
  $scope.user = {};
  $scope.user.interests = [];
  $scope.ID=undefined;
  $scope.photo = undefined;
  $scope.interest={'category':undefined,'value':undefined};

  //VARIABLES GLOBALES
  var data;

  //AGREGADO DE USUARIO
  $scope.addUser = function() {
    for(var i in $scope.checkBoxes)
      if($scope.checkBoxes[i].check) $scope.user.interests.push({'category':$scope.checkBoxes[i].category,'value':$scope.checkBoxes[i].value});
    $scope.user.photo_profile = "no_photo";
    $http({
      url: '/users',
      method: "POST",
      headers:{
        'Content-Type': 'application/json'
      },
      data: { 'user' : $scope.user}
    }).then(function(response) {
      console.log(response.data);
    },
    function(response) {
      console.error(response);
    });
  };


  //GET DE TODOS LOS INTERESES PARA QUE EL USUARIO ELIJA
  $scope.getAllInterests = function(){
    $scope.checkBoxes = [];
    $http.get("/interests").then(function(result){
      for(var i in result.data.interests){
        data = {category: result.data.interests[i].category, value: result.data.interests[i].value, check: false};
        $scope.checkBoxes.push(data);
      }
    });
  };

  //ELIMINACION DE USUARIO
  $scope.deleteUser = function() {
    $http.delete('/users/'+$scope.ID).then(function(response) {
      console.log(response);
    });
  };

  //GET DE TODOS LOS INTERESES PARA MOSTRARLOS EN UNA TABLA
  $scope.getInterestsForTable = function () {
    $http.get("/interests").then(function(response) {
      console.log(response.data);
      $scope.interests = response.data.interests;
    });
  };

  //GET DE USUARIO ESPECIFICO PARA MOSTRAR EN TABLA
  $scope.getUser = function() {
    $http.get("/users/"+$scope.ID).then(function(response) {
      console.log(response.data.user);
      $scope.user = [response.data.user];
    });
  };

  //GET DE USUARIO PARA MODIFICAR
  $scope.getUserToModify = function() {
    $http.get("/users/"+$scope.ID).then(function(response) {
       console.log(response.data.user);
       $scope.user = response.data.user;
     });
   };

  //GET DE TODOS LOS USUARIOS
  $scope.getUsers = function () {
    $http.get("/users")
    .then(function(response) {
      console.log(response.data);
      $scope.user = response.data.users;
    });
  };

  //GET DE TODOS LOS INTERESES, INCLUIDOS LOS DEL USUARIO
  $scope.getAllInterestsAndMine = function(){
    if($scope.user.interests === undefined) return;
    $scope.checkBoxes = [];
    $http.get("/interests").then(function(result){
      for(var i in result.data.interests){
        data = {category: result.data.interests[i].category, value: result.data.interests[i].value, check: false};
        for(var j in $scope.user.interests){
          if($scope.user.interests[j].category == result.data.interests[i].category &&
            $scope.user.interests[j].value == result.data.interests[i].value){
            data.check = true;
            break;
          }
        }
        $scope.checkBoxes.push(data);
      }
    });
  };

  //MODIFICACION DE FOTO DE PERFIL
  $scope.updatePhoto = function() {
    $http({
      url: '/users/'+$scope.ID+"/photo",
      method: "PUT",
      headers:{
        'Content-Type': 'application/json'
      },
      data:  { 'photo' : $scope.photo}
    }).then(function(response) {
      console.log(response.data);
    },
    function(response) {
      console.error(response);
    });
  };

  //MODIFICACION DE USUARIO
  $scope.modUser = function() {
    $scope.user.interests = [];
    for(var i in $scope.checkBoxes)
      if($scope.checkBoxes[i].check) $scope.user.interests.push({'category':$scope.checkBoxes[i].category,'value':$scope.checkBoxes[i].value});
    $scope.user.photo_profile = "no_photo";
    $http({
      url: '/users/'+$scope.ID,
      method: "PUT",
      headers:{
        'Content-Type': 'application/json'
      },
      data:  { 'user' : $scope.user}
    }).then(function(response) {
      console.log(response.data);
    },
    function(response) {
      console.error(response);
    });
  };

  //ALTA DE INTERES
  $scope.addInterest = function() {
    $http({
      url: '/interests',
      method: "POST",
      headers:{
        'Content-Type': 'application/json'
      },
      data: { 'interest' : $scope.interest}
    }).then(function(response) {
      console.log(response.data);
    },
    function(response) {
      console.error(response);
    });
  };

});
