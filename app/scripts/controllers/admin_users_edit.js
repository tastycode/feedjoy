'use strict';

angular.module('feedjoyApp')
  .controller('AdminUsersEditCtrl', function ($scope, $http, $location, $routeParams) {
    $scope.user = {};
    $scope.roles = [
      {id: 'donor', text: 'Donor'},
      {id: 'agency', text: 'Agency'},
      {id: 'courier', text: 'Courier'},
      {id: 'admin', text: 'Admin'}
    ];

    $scope.$watch('autocompleteDetail', function(newVal, oldVal) {
      if (newVal) {
        $scope.user.location = {
          type: 'Point',
          coordinates: [newVal.geometry.location.lng(), newVal.geometry.location.lat()],
          text: $scope.autocomplete
        }
      } 
    }, true);

    $http.get('/api/users/' + $routeParams.id).success(function(user) {
      $scope.user = user;
      $scope.autocomplete = $scope.user.location.text;
    });

    $scope.update = function(form) {
      $http.put('/api/admin/users/' + $routeParams.id, $scope.user).success(function(user) {
        $location.path('/admin/users');
      });
    }
  });
