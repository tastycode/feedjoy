'use strict';

describe('Directive: ffNav', function () {

  // load the directive's module
  beforeEach(module('feedingForeverApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ff-nav></ff-nav>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the ffNav directive');
  }));
});
