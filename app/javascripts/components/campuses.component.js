(function () {
    'use strict';

    angular
        .module('app.campuses', ['ngRoute'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/campuses', {
                templateUrl: 'partials/components/campuses.component.html',
                bindToController: true,
                controllerAs: 'vm',
                controller: 'CampusesCtrl',
                resolve: {
                    campuses: function (campusService) {
                        return campusService.getCampuses();
                    }
                }
            });
        }])
        .controller('CampusesCtrl', ['campuses', function (campuses) {
            var self = this;
            self.campuses = campuses;

            self.showMap = function (campus) {
                
            }
        }]);
})();