'use strict';

angular.module('feedjoyApp')
  .controller('CouriersCtrl', function ($scope, $http, MapService, PickupService) {
    MapService.setupMap($scope);
    function loadData() {
      $http.get('/api/pickups/near', {params: {status: 'claimed'}}).success(function(pickups) {
        $scope.availablePickups = pickups;
        $scope.markers = MapService.makeMarkersFor(pickups, function(pickup) {
          return pickup.kind;
        });
      });

      $http.get('/api/pickups', {params: {status: 'moving', relatedBy: 'movingUser'}}).success(function(pickups) {
        $scope.movingPickups = pickups;
      });
    };

    $scope.move = function(pickup) {
      PickupService.move(pickup).success(function() {
        loadData();
      });
    };

    $scope.complete = function(pickup) {
      PickupService.complete(pickup).success(function() {
        loadData();
      });
    };

    loadData();
  });
