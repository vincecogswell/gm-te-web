(function () {
    'use strict';

    // Declare app level module which depends on views, and components
    angular
        .module('app', ['ngRoute','ui.bootstrap','smart-table','app.campuses','app.campus'])
        .config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix('!');
            $routeProvider.otherwise({redirectTo: '/campuses'});
        }]);
})();

