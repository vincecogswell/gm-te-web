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
                    }
                }
            });
        }])
        .controller('CampusCtrl', ['campusService', '$routeParams', function(campusService, $routeParams) {
            var self = this;
            var campusId = parseInt($routeParams.campusId);
            self.campus = campusService.getCampus(campusId);
        }]);
})();