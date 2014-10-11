'use strict';

angular.module('feedjoyApp')
  .controller('AdminPickupsCtrl', function ($scope, $http, PickupService, MapService) {
    MapService.setupMap($scope);
    $scope.summary = {};
    $scope.loadData = function() {
      $http.get('/api/admin/pickups', {params: {status: $scope.filterStatus}}).success(function(pickups) {
        $scope.pickups = pickups;
        MapService.makeMarkersFor($scope.pickups, function(pickup) {
          return pickup.kind;
        });
      });

      $http.get('/api/admin/pickups/summary').success(function(summary) {
        $scope.summary = summary;
      });
    }

    $scope.$watch('filterStatus', function(newVal, oldVal) {
      $scope.loadData();
    });

    $scope.cancel = function(pickup) {
      PickupService.cancel(pickup).success($scope.loadData);
    };
  });
