(function () {
    'use strict';

    angular
        .module('app.building', ['ngRoute'])
        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/campus/:campusId/building/:buildingId', {
                templateUrl: 'partials/components/building.component.html',
                bindToController: true,
                controllerAs: 'vm',
                controller: 'BuildingCtrl',
                resolve: {
                    campusService: function(campusService) {
                        return campusService;
                    },
                    buildingService: function(buildingService) {
                        return buildingService;
                    }
                }
            });
        }])
        .controller('BuildingCtrl', ['campusService', 'buildingService', '$routeParams', function(campusService, buildingService, $routeParams) {
            var self = this;
            var campusId = parseInt($routeParams.campusId);
            self.campus = campusService.getCampus(campusId);
        }]);
})();