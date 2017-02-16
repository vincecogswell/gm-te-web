'use strict';

angular.module('myApp.campuses', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/campuses', {
    templateUrl: 'campuses/campuses.html',
    controller: 'CampusesCtrl'
  });
}])

.controller('CampusesCtrl', [function() {

}]);