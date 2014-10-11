'use strict';

angular.module('feedjoyApp')
  .controller('AdminUsersCtrl', function ($scope, $http, $location) {
    $scope.loadData = function() {
      $http.get('/api/admin/users').success(function(users) {
        $scope.users = users;
      });
    }
    $scope.loadData();

    $scope.edit = function(user) {
      $location.path('/admin/users/' + user._id +'/edit');
    };

    $scope.remove = function(user) {
      $http.delete('/api/admin/users/' + user._id).success(function(user) {
        $scope.loadData();
      });
    };
  });
