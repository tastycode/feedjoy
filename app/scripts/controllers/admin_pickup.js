'use strict';

angular.module('feedjoyApp')
  .controller('AdminPickupCtrl', function ($scope, $routeParams, $http, PickupService) {
    $scope.pickup = {};

    $scope.loadData = function() {
      PickupService.show($routeParams.id).success(function(pickup) {
        $scope.pickup = pickup;
        if (pickup.status === 'claimed') {
          $scope.nearbyAgencies = [];
          $scope.loadNearbyCouriers();
        }
        if (pickup.status === 'available') {
          $scope.nearbyCouriers = [];
          $scope.loadNearbyAgencies();
        }

        if (pickup.status === 'moving') {
          $scope.nearbyCouriers = [];
        }
      });
    };

    $scope.loadNearbyCouriers = function() {
      $http.get('/api/users/near', {params:{
                  nearType: 'Pickup',
                  nearId: $scope.pickup._id,
                  withRole: 'courier'
                }}).success(function(couriers) {
                  $scope.nearbyCouriers =  couriers;
                });
    };

    $scope.loadNearbyAgencies = function() {
      $http.get('/api/users/near', {params:{
                  nearType: 'Pickup',
                  nearId: $scope.pickup._id,
                  withRole: 'agency'
                }}).success(function(agencies) {
                  $scope.nearbyAgencies =  agencies;
                });
    };

    $scope.claimFor = function(agency) {
      PickupService.claim($scope.pickup, {claimedUser: agency._id}).success($scope.loadData);
    };

    $scope.moveFor = function(courier) {
      PickupService.move($scope.pickup, {movingUser: courier._id}).success($scope.loadData);
    };

    $scope.complete = function() {
      PickupService.complete($scope.pickup).success($scope.loadData);
    };

    $scope.cancel = function() {
      PickupService.cancel($scope.pickup).success($scope.loadData);
    };

    $scope.resetTo = function(revertState) {
      $scope.pickup.status = revertState;
      $http.put('/api/pickups/' +  $routeParams.id, $scope.pickup).success(function(pickup) {
        $scope.loadData();
      });
    };

    $scope.loadData();
  });
