'use strict';

angular.module('feedjoyApp')
  .controller('AgenciesCtrl', function ($scope, $http, MapService) {
    //maps concerns {
    MapService.setupMap($scope);
    function pickupMessage(pickup) {
      var str = '<b>'+pickup.kind+'</b>';
      if (pickup.weight) {
        str += '<br/>'+pickup.weight+' lbs';
      }
      return str;
    }
    function loadData() {
      $http.get('/api/pickups/near').success(function(pickups) {
        $scope.pickups = pickups;
        $scope.markers = MapService.makeMarkersFor(pickups, pickupMessage);
      });

      $http.get('/api/pickups', {params: {status: 'claimed', relatedBy: 'claimedUser'}}).success(function(pickups) {
        $scope.claimedPickups = pickups;
      });
    };
    loadData();
    //}
    $scope.claim = function(pickup) {
      pickup.status = 'claimed';
      $http.put('/api/pickups/'+pickup._id, pickup).success(function(updatedPickup) {
        loadData();
      });
    };

    $scope.complete = function(pickup) {
      pickup.status = 'complete';
      $http.put('/api/pickups/'+pickup._id, pickup).success(function(updatedPickup) {
        loadData();
      });
    };
  });
