(function () {
    'use strict';

    angular
        .module('app.lot', ['ngRoute'])
        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/campus/:campusId/lot/:lotId', {
                templateUrl: 'partials/components/lot.component.html',
                bindToController: true,
                controllerAs: 'vm',
                controller: 'LotCtrl',
                resolve: {
                    campusService: function(campusService) {
                        return campusService;
                    },
                    lotService: function(lotService) {
                        return lotService;
                    }
                }
            });
        }])
        .controller('LotCtrl', ['campusService', 'lotService', '$routeParams', function(campusService, lotService, $routeParams) {
            var self = this;
            var campusId = parseInt($routeParams.campusId);
            self.campus = campusService.getCampusById(campusId);
        }]);
})();