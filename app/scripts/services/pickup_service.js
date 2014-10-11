'use strict';

angular.module('feedjoyApp')
  .service('PickupService', function PickupService($http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var update = function(pickup, updates) {
      pickup = _.extend(angular.copy(pickup), updates);
      return $http.put('/api/pickups/'+pickup._id, pickup);
    };
    return {
      cancel: function(pickup) {
        return update(pickup, {status: 'canceled'});
      },
      show: function(id) {
        return $http.get('/api/pickups/' + id);
      },
      complete: function(pickup) {
        return update(pickup, {status: 'complete'});
      },
      claim: function(pickup, options) {
        var updates = _.extend({status: 'claimed'}, options);
        return update(pickup, updates);
      },
      move: function(pickup, options) {
        var updates = _.extend({status: 'moving'}, options);
        return update(pickup, updates);
      },

    };
  });
