'use strict';

angular.module('feedjoyApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
    $scope.hasRole = Auth.hasRole;
    $scope.logout = function() {
      Auth.logout()
      .then(function() {
        $location.path('/login');
      });
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
