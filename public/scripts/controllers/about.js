'use strict';

/**
 * @ngdoc function
 * @name pixwallApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the pixwallApp
 */
angular.module('pixwallApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
