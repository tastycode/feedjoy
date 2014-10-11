'use strict';

angular.module('feedjoyApp')
  .controller('DonorsCtrl', function ($scope, $http) {
    //maps concerns {
    function loadData() {
      $http.get('/api/pickups', {params: {relatedBy: 'donorUser'}}).success(function(pickups) {
        $scope.pickups = pickups;
      });
    };
    loadData();
    //}
    $scope.cancel = function(pickup) {
      pickup.status = 'canceled';
      $http.put('/api/pickups/'+pickup._id, pickup).success(function(updatedPickup) {
        loadData();
      });
    };
  });
