'use strict';

angular.module('feedjoyApp')
  .factory('Session', function ($resource) {
    return $resource('/api/session/');
  });
