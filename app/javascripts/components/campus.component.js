(function () {
    'use strict';

    angular
        .module('app.campus', ['ngRoute'])
        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/campus/:campusId', {
                templateUrl: 'partials/components/campus.component.html',
                bindToController: true,
                controllerAs: 'vm',
                controller: 'CampusCtrl',
                resolve: {
                    campusService: function(campusService) {
                        return campusService;
                    },
                    buildingService: function(buildingService) {
                        return buildingService;
                    },
                    lotService: function(lotService) {
                        return lotService;
                    },
                    gateService: function(gateService) {
                        return gateService;
                    }
                }
            });
        }])
        .controller('CampusCtrl', ['campusService', 'buildingService', 'lotService', 'gateService', '$routeParams', '$location', function(campusService, buildingService, lotService, gateService, $routeParams, $location) {
            var self = this;

            var campusId = parseInt($routeParams.campusId);
            self.campus = campusService.getCampus(campusId);

            self.buildings = self.campus ? buildingService.getBuildingsOnCampus(campusId) : null;
            self.lots = self.campus ? lotService.getLotsOnCampus(campusId) : null;
            self.gates = self.campus ? gateService.getGatesOnCampus(campusId) : null;

            self.goBack = function () {
                $location.path('/campuses');
            }
        }]);
})();