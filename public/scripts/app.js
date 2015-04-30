'use strict';

/**
 * @ngdoc overview
 * @name pixwallApp
 * @description
 * # pixwallApp
 *
 * Main module of the application.
 */
angular
  .module('pixwallApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
       .when('/map/:mapId', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
     /* .otherwise({
        redirectTo: '/'
      })*/;
  })
  ;
