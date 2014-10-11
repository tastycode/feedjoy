'use strict';

angular.module('feedjoyApp')
  .provider('requestCounter', function ($httpProvider) {
    this.$get = function () {
      var obj = {count: 0};
      $httpProvider.defaults.transformRequest.push(function(data) {
        obj.count++;
        return data;
      });

      $httpProvider.defaults.transformResponse.push(function(data) {
        obj.count--;
        return data;
      });

      return obj;
    };
  });
