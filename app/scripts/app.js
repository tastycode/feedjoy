'use strict';

angular.module('feedjoyApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'leaflet-directive',
  'angularMoment',
  'angularFileUpload',
  'angulartics', 
  'angulartics.mixpanel',
  'checklist-model',
  'ngAutocomplete'
])
  .config(function ($routeProvider, $locationProvider, $httpProvider, $analyticsProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/main',
        controller: 'MainCtrl'
      })
      .when('/home', {
        templateUrl: 'partials/home',
        controller: 'HomeCtrl',
        authenticate: true
      })
      .when('/login', {
        templateUrl: 'partials/login',
        controller: 'LoginCtrl'
      })
      .when('/signup', {
        templateUrl: 'partials/signup',
        controller: 'SignupCtrl'
      })
      .when('/settings', {
        templateUrl: 'partials/settings',
        controller: 'SettingsCtrl',
        authenticate: true
      })
      .when('/pickup', {
        templateUrl: 'partials/pickups/new',
        controller: 'PickupFormCtrl'
      })
      .when('/pickups/:id', {
        templateUrl: 'partials/pickups/show',
        controller: 'PickupCtrl'
      })
      .when('/admin/pickups', {
        templateUrl: 'partials/admin/pickups',
        controller: 'AdminPickupsCtrl'
      })
      .when('/admin/pickups/:id', {
        templateUrl: 'partials/admin/pickup',
        controller: 'AdminPickupCtrl'
      })
      .when('/admin/users/:id/edit', {
        templateUrl: 'partials/admin/users/edit',
        controller: 'AdminUsersEditCtrl'
      })
      .when('/admin/users', {
        templateUrl: 'partials/admin/users',
        controller: 'AdminUsersCtrl'
      })
      .when('/faq', { templateUrl: 'partials/faq'})
      .when('/about', { 
        templateUrl: 'partials/about',
        controller: 'AboutCtrl'
      })
      .when('/terms', { 
        templateUrl: 'partials/terms',
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
    // Intercept 401s and 403s and redirect you to login
    $httpProvider.interceptors.push(['$q', '$location', function($q, $location) {
      return {
        'responseError': function(response) {
          if(response.status === 401 || response.status === 403) {
            $location.path('/login');
            return $q.reject(response);
          }
          else {
            return $q.reject(response);
          }
        }
      };
    }]);
    $analyticsProvider.registerPageTrack(function (path) {
      console.log('Tracking Pageview: ', path);
      //mixpanel.track_pageview(path);
    });

    $analyticsProvider.registerEventTrack(function (action, properties) {
      console.log('Tracking Eventw: ', action, properties);
      //mixpanel.track(action, properties);
    });
  })
  .run(function ($rootScope, $location, Auth) {

    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$routeChangeStart', function (event, next) {
      
      if (next.authenticate && !Auth.isLoggedIn()) {
        $location.path('/login');
      }
    });
  });
