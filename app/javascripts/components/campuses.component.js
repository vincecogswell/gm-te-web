(function () {
    'use strict';

    angular
        .module('app.campuses', ['ngRoute'])
        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/campuses', {
                templateUrl: 'partials/components/campuses.component.html',
                bindToController: true,
                controllerAs: 'vm',
                controller: 'CampusesCtrl'
            });
        }])
        .controller('CampusesCtrl', [function() {
            var self = this;

            self.campuses = [
                {
                    id: 1,
                    name: "GM Technical Center",
                    status: "Active",
                    num_buildings: 38,
                    num_lots: 30
                },
                {
                    id: 2,
                    name: "Michigan State University",
                    status: "Active",
                    num_buildings: 120,
                    num_lots: 80
                }
            ];
        }]);
})();