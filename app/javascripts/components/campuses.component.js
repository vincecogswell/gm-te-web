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
        .controller('CampusesCtrl', ['campuses', '$uibModal', function (campuses, $uibModal) {
            var self = this;
            self.campuses = campuses;

            var map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: 38.0902, lng: -95.7129},
                zoom: 4
            });         
            var drawingManager = new google.maps.drawing.DrawingManager({
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: ['rectangle', 'polygon']
                },
                rectangleOptions: {
                    draggable: true,
                    editable: true
                },
                polygonOptions: {
                    draggable: true,
                    editable: true
                }
            });
            drawingManager.setMap(map);

            self.addCampus = function () {
                var modalInstance = $uibModal.open({   
                    controller: 'AddCampusController',
                    controllerAs: 'vm',           
                    templateUrl: 'partials/modals/addCampus.modal.html',
                    size: 'lg'           
                });

                modalInstance.result.then(function (campus) {
                    console.log(campus);
                });             
            }
        }]);
})();