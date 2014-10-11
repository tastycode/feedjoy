'use strict';

angular.module('feedjoyApp')
  .controller('PickupCtrl', function ($scope, $http, $routeParams, $location) {
    $scope.$watch("pickup.location", function() {
      if ($scope.pickup.location) {   
        $scope.center = _.extend($scope.pickup.location, {zoom: 12});
      }
    });
    angular.extend($scope, {
      tiles: {
              url: 'https://{s}.tiles.mapbox.com/v3/tastycode.h251ejeb/{z}/{x}/{y}.png',
              options: {
                  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">Mapbox</a>'
              }
      },
      defaults: {
        scrollWheelZoom: false
      }
    }); 

    $scope.markers = {};
    $scope.center = {zoom: 12};

    function pickupMessage(pickup) {
      var str = '<b>'+pickup.kind+'</b>';
      if (pickup.weight) {
        str += '<br/>'+pickup.weight+' lbs';
      }
      return str;
    }
    function makeMarkers() {
      var markers = {};
      markers[0] = {
        lat: $scope.pickup.location.lat,
        lng: $scope.pickup.location.lng,
        message: pickupMessage($scope.pickup)
      };
      $scope.markers = markers;
      console.log($scope.markers);
    };
    $scope.pickup = {};
    $http.get('/api/pickups/' +  $routeParams.id).success(function(pickup) {
      console.log(pickup);
      $scope.pickup = pickup;
      makeMarkers();
    });
  });
