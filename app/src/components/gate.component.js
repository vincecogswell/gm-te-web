(function () {
    'use strict';

    angular
        .module('app.gate', ['ngRoute'])
        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/campus/:campusId/gate/:gateId', {
                templateUrl: 'partials/components/gate.component.html',
                bindToController: true,
                controllerAs: 'vm',
                controller: 'GateCtrl',
                resolve: {
                    campusService: function(campusService) {
                        return campusService;
                    },
                    gateService: function(gateService) {
                        return gateService;
                    }
                }
            });
        }])
        .controller('GateCtrl', ['campusService', 'gateService', '$routeParams', function(campusService, gateService, $routeParams) {
            var self = this;
            var campusId = parseInt($routeParams.campusId);
            self.campus = campusService.getCampus(campusId);
        }]);
})();