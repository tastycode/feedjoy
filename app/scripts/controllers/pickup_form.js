'use strict';

angular.module('feedjoyApp')
  .controller('PickupFormCtrl', function ($scope, $upload, $location, $http, $analytics) {

    $scope.pickup = {};

    $scope.$watch('currentUser', function(currentUser) {
      if (!currentUser) return;
      $scope.autocomplete = currentUser.location.text;
      $scope.pickup.location = currentUser.location;
      $scope.pickup.city = currentUser.city;
      $scope.pickup.state = currentUser.state;
      $scope.pickup.phone = currentUser.phone;
    });

    $scope.onFileSelect = function($files) {
      $scope.file = $files[0];
    };

    $scope.dayOptions = (function() {
      return _.range(0,10).map(function(i) {
        return moment().add('days', i).format('MM/DD/YY');
      });
    }());

    $scope.timeOptions = (function() {
      var minutesAfter = parseInt(moment().format('mm'));
      var minutesBeforeNextHour = 60 - minutesAfter;
      return _.range(0,24).map(function(i) {
        return moment().add('hours', i).add('minutes', minutesBeforeNextHour).format('h:mm a');
      });
    }());

    $scope.pickupAtDate = $scope.dayOptions[0];
    $scope.pickupAtTime = $scope.timeOptions[0];

    $scope.finishByDate = $scope.dayOptions[0];
    $scope.finishByTime = $scope.timeOptions[3];

    function watchDateField(prefixField) {
      var dateField = prefixField + 'Date';
      var timeField = prefixField + 'Time';
      var update = function() {
        $scope.pickup[prefixField] = $scope[dateField] + ' ' + $scope[timeField];
      };
      $scope.$watch(dateField, update);
      $scope.$watch(timeField, update);
    }; 

    watchDateField('finishBy');
    watchDateField('pickupAt');

    $scope.$watch('autocompleteDetail', function(newVal, oldVal) {
      if (newVal) {
        $scope.pickup.location = {
          type: 'Point',
          coordinates: [newVal.geometry.location.lng(), newVal.geometry.location.lat()],
          text: $scope.autocomplete
        }
      } 
    }, true);

    $scope.$watch('pickup.weight', function(newVal, old) {
      $scope.pickup.inputWeight = newVal;
    });

    $scope.createPickup = function(form) {
      var pickup = angular.copy($scope.pickup);
      $scope.submitted = true;
      if (!form.$valid) {
        return false;
      }
      if ($scope.file) {
        $upload.upload({
          url: '/api/pickups',
          method: 'POST',
          data: pickup,
          file: $scope.file
        }).progress(function(evt) {
          console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function(pickup, status, headers, config) {
          $analytics.eventTrack('pickup_created', pickup);
          $location.path('/pickups/' + pickup._id);
        });
      } else {
        $http.post('/api/pickups', pickup).success(function(pickup) {
          $location.path('/pickups/' + pickup._id);
        });
      }
    };
  });
