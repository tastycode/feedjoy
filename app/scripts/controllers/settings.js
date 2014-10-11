'use strict';

angular.module('feedjoyApp')
  .controller('SettingsCtrl', function ($scope, User, Auth) {
    $scope.errors = {};
    $scope.user = {};

    $scope.hasRole = Auth.hasRole;

    $scope.updateProfile = function(form) {
      $scope.submitted = true;

      if(form.$valid) {

        Auth.updateProfile( $scope.user )
        .then( function() {
          $scope.message = 'Profile updated';
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
        });
      }
		};
  });
