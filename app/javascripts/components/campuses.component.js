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

            var modalMap = new google.maps.Map(document.getElementById('modal-map'), {
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
            drawingManager.setMap(modalMap);

            $("#modal-add-campus").on("shown.bs.modal", function () {
                var curCenter = modalMap.getCenter();
                google.maps.event.trigger(modalMap, 'resize');
                modalMap.setCenter(curCenter);
            });

        }]);
})();