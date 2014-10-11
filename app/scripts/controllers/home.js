'use strict';

angular.module('feedjoyApp')
  .controller('HomeCtrl', function ($scope, $http, Auth) {

    $scope.hasRole = Auth.hasRole;
  });
