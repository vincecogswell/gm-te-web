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

            // implement checkboxes that control which components (buildings, lots, gates) are displayed on the map

            var campusId = parseInt($routeParams.campusId);
            campusService.getCampuses( function (campuses) {
                self.campus = campuses[campusId];
            });
            //self.campus = campusService.getCampus(campusId);

            getBuildings();
            getLots();
            getGates();

            function getBuildings() {
                buildingService.getBuildings(campusId, function (buildings) {
                    self.buildings = buildings;
                    // populate map
                });
            }

            function getLots() {
                lotService.getLots(campusId, function (lots) {
                    self.lots = lots;
                    // populate map
                });
            }

            function getGates() {
                gateService.getGates(campusId, function (gates) {
                    self.gates = gates;
                    // populate map
                });
            }

            self.saveBuilding = function () {
                // TO DO: Api Call
                drawingManagerBuilding.setDrawingMode(null);
                var newBuilding = {
                    id: 1,
                    name: "College of Engineering",
                    status: "Active",
                    location: modalMapBuilding.getCenter(),
                    deleted: false
                };
                self.buildings = [newBuilding];
                counter1++;

                var marker = new google.maps.Marker({
                    position: modalMapBuilding.getCenter(),
                    map: map,
                    title: newBuilding.name
                });

                $('#modal-building').modal('toggle');
            }

            self.saveLot = function () {
                // TO DO: Api Call
                drawingManagerLot.setDrawingMode(null);
                var newLot = {
                    id: 1,
                    name: "Lot 39",
                    status: "Active",
                    access: "Everyone",
                    hours: "24/7",
                    location: modalMapLot.getCenter(),
                    deleted: false
                };
                self.lots = [newLot];

                var rectangle = new google.maps.Rectangle({
                    map: map,
                    bounds: {
                        north: 42.725871,
                        south: 42.725387,
                        east: -84.480211,
                        west: -84.481833
                    }
                });

                $('#modal-lot').modal('toggle');
            }

            self.saveGate = function () {
                // TO DO: Api Call
                drawingManagerGate.setDrawingMode(null);
                var newGate = {
                    id: 1,
                    name: "Gate A",
                    status: "Active",
                    access: "Everyone",
                    hours: "24/7",
                    instructions: null,
                    location: modalMapGate.getCenter(),
                    deleted: false
                };
                self.gates = [newGate];

                var marker = new google.maps.Marker({
                    position: modalMapGate.getCenter(),
                    map: map,
                    title: newGate.name
                });

                $('#modal-gate').modal('toggle');
            }

            self.updateBuilding = function (buildingId) {

            }

            self.updateLot = function (lotId) {

            }

            self.updateGate = function (gateId) {
                
            }

            self.deleteBuilding = function (buildingId) {

            }

            self.deleteLot = function (lotId) {

            }

            self.deleteGate = function (gateId) {

            }



            var map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: 42.5122427, lng: -83.0334234},
                zoom: 12
            });
            map.fitBounds(self.campus.bounds);

            var modalMapBuilding = new google.maps.Map(document.getElementById('modal-map-building'), {
                center: {lat: 38.0902, lng: -95.7129},
                zoom: 12
            });
            modalMapBuilding.fitBounds(self.campus.bounds);  

            var drawingManagerBuilding = new google.maps.drawing.DrawingManager({
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: ['marker']
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
            drawingManagerBuilding.setMap(modalMapBuilding);


            var modalMapLot = new google.maps.Map(document.getElementById('modal-map-lot'), {
                center: {lat: 38.0902, lng: -95.7129},
                zoom: 12
            });
            modalMapLot.fitBounds(self.campus.bounds); 

            var drawingManagerLot = new google.maps.drawing.DrawingManager({
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
            drawingManagerLot.setMap(modalMapLot);


            var modalMapGate = new google.maps.Map(document.getElementById('modal-map-gate'), {
                center: {lat: 38.0902, lng: -95.7129},
                zoom: 12
            });
            modalMapGate.fitBounds(self.campus.bounds); 

            var drawingManagerGate = new google.maps.drawing.DrawingManager({
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: ['marker']
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
            drawingManagerGate.setMap(modalMapGate);


            $("#modal-building").on("shown.bs.modal", function () {
                var curCenter = modalMapBuilding.getCenter();
                google.maps.event.trigger(modalMapBuilding, 'resize');
                modalMapBuilding.setCenter(curCenter);
                modalMapBuilding.fitBounds(self.campus.bounds);
            });

            $("#modal-lot").on("shown.bs.modal", function () {
                var curCenter = modalMapLot.getCenter();
                google.maps.event.trigger(modalMapLot, 'resize');
                modalMapLot.setCenter(curCenter);
                modalMapLot.fitBounds(self.campus.bounds);
            });

            $("#modal-gate").on("shown.bs.modal", function () {
                var curCenter = modalMapGate.getCenter();
                google.maps.event.trigger(modalMapGate, 'resize');
                modalMapGate.setCenter(curCenter);
                modalMapGate.fitBounds(self.campus.bounds);
            });


            self.goBack = function () {
                $location.path('/campuses');
            }
        }]);
})();