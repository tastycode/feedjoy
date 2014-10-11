'use strict';

angular.module('feedjoyApp')
  .controller('HomeAgencyCtrl', function ($scope, $http, PickupService, MapService) {
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
        MapService.makeMarkersFor($scope.pickups, pickupMessage);
      });

      $http.get('/api/pickups', {params: {status: 'claimed', relatedBy: 'claimedUser'}}).success(function(pickups) {
        $scope.claimedPickups = pickups;
      });
    };
    loadData();
    //}
    $scope.claim = function(pickup) {
      PickupService.claim(pickup).success(loadData);
    };

    $scope.complete = function(pickup) {
      PickupService.complete(pickup).success(loadData);
    };
  });
