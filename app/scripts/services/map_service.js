'use strict';

angular.module('feedjoyApp')
  .service('MapService', function MapService() {
    return {
      makeMarkersFor: function(objects, messageFn) {
        var markers = {};
        objects.map(function(object, i) {
          markers[i] = {
            lat: object.location.coordinates[1],
            lng: object.location.coordinates[0],
            message: messageFn(object)
          };
        });
        return markers;
      },
      setupMap: function(scope) {
        var userLocation = scope.currentUser.location;
        var location = {
          lat: userLocation.coordinates[1],
          lng: userLocation.coordinates[0]
        };
        angular.extend(scope, {
          center: _.extend(location, {zoom: 12}),
          tiles: {
                  url: 'https://{s}.tiles.mapbox.com/v3/tastycode.h251ejeb/{z}/{x}/{y}.png',
                  options: {
                      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">Mapbox</a>'
                  }
          },
          defaults: {
            scrollWheelZoom: false
          },
          markers: []
        }); 
      }
    }
  });
