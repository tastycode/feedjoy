'use strict';

angular.module('feedjoyApp')
  .controller('SubmitCtrl', function ($scope, requestCounter) {
    var defaultText = 'Request Pickup';
    $scope.requests = requestCounter;
    $scope.$watch('requests.count', function(newValue, oldValue) {
      if (newValue > 0) {
        $scope.submitText = 'Processing...';
      } else {
        $scope.submitText = defaultText;
      }
    });
  });
