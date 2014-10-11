'use strict';

angular.module('feedjoyApp')
  .controller('SignupCtrl', function ($scope, Auth, $location) {
    $scope.user = {
      roleTags: ['donor']
    };

    $scope.errors = {};

    $scope.autocomplete = "";

    $scope.roles = [
      {id: 'donor', text: 'I would like to post donations'},
      {id: 'agency', text: 'My organization would like to receive donations'},
      {id: 'courier', text: 'My organization provides courier services and can deliver donations'}
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

    $scope.register = function(form) {

      $scope.submitted = true;

      if(form.$valid) {
        Auth.createUser({
          name: $scope.user.name,
          organizationName: $scope.user.organizationName,
          phone: $scope.user.phone,
          email: $scope.user.email,
          notes: $scope.user.notes,
          password: $scope.user.password,
          roleTags: $scope.user.roleTags,
          location: $scope.user.location
        })
        .then( function() {
          // Account created, redirect to home
          $location.path('/home');
        })
        .catch( function(err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.type;
          });
        });
      }
    };
  });
