(function () {
    'use strict';

    // Declare app level module which depends on views, and components
    angular
        .module('app', ['ngRoute','ngCookies','ui.bootstrap','smart-table','app.login','app.campuses','app.campus'])
        .config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix('!');
            $routeProvider.otherwise({redirectTo: '/login'});
        }]);
})();

