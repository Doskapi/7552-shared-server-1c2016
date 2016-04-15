var app = angular.module('MagicMatch', []);
app.controller('Controller', function($scope,$http) {

  //SCOPE VARIABLES
  $scope.user = {};
  $scope.user.interests = [];
  $scope.ID=undefined;
  $scope.interest={'category':undefined,'value':undefined};

  $scope.addUser = function() {
    for(var i in $scope.checkBoxes)
      if($scope.checkBoxes[i].check) $scope.user.interests.push({'category':$scope.checkBoxes[i].category,'value':$scope.checkBoxes[i].value});
    $http({
      url: '/users',
      method: "POST",
      data: { 'user' : $scope.user}
    }).then(function(response) {
      console.log(response.data);
    },
    function(response) { // optional
      // failed
    });
  };

  var data;
  $scope.getAllInterests = function(){
    $scope.checkBoxes = [];
    $http.get("/interests")
    .then(function(result){ /*Caso success*/
      for(var i in result.data){
        data = {category: result.data[i].category, value: result.data[i].value, check: false};
        $scope.checkBoxes.push(data);
      }
    });
  };

  $scope.deleteUser = function() {
    $http.delete('/users/'+$scope.ID).then(function(response) {
      console.log(response);
    });
  };

  $scope.getInterestsForTable = function () {
    $http.get("/interests")
    .then(function(response) {
      $scope.interests = response.data;
    });
  };

  $scope.getUser = function() {
    $http.get("/users/"+$scope.ID).then(function(response) {
      $scope.user = [response.data.user];
    });
  };

  $scope.getUserToModify = function() {
    $http.get("/users/"+$scope.ID).then(function(response) {
      console.log(response.data.user);
      $scope.user = response.data.user;
    });
  };

  $scope.getUsers = function () {
    $http.get("/users")
    .then(function(response) {
      console.log(response.data);
      $scope.user = response.data.users;
    });
  };

  $scope.getAllInterestsAndMine = function(){
    if($scope.user.interests === undefined) return;
    $scope.checkBoxes = [];
    $http.get("/interests")
    .then(function(result){ /*Caso success*/
      for(var i in result.data){
        data = {category: result.data[i].category, value: result.data[i].value, check: false};
        for(var j in $scope.user.interests){
          if($scope.user.interests[j].category == result.data[i].category &&
            $scope.user.interests[j].value == result.data[i].value){
            data.check = true;
            break;
          }
        }
        $scope.checkBoxes.push(data);
      }
    });
  };

  $scope.modUser = function() {
    $scope.user.interests = [];
    for(var i in $scope.checkBoxes)
      if($scope.checkBoxes[i].check) $scope.user.interests.push({'category':$scope.checkBoxes[i].category,'value':$scope.checkBoxes[i].value});
    $http({
      url: '/users/'+$scope.ID,
      method: "PUT",
      data: { 'user' : $scope.user}
    }).then(function(response) {
      console.log(response.data);
    },
    function(response) { // optional
      // failed
    });
  };

  $scope.addInterest = function() {
    $http({
      url: '/interests',
      method: "POST",
      data: { 'interest' : $scope.interest}
    }).then(function(response) {
      console.log(response.data);
    },
    function(response) { // optional
      // failed
    });
  };

});
