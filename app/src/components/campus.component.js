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
                    },
                    mapService: function(mapService) {
                        return mapService;
                    }
                }
            });
        }])
        .controller('CampusCtrl', ['campusService', 'buildingService', 'lotService', 'gateService', 'mapService', '$routeParams', '$location', function(campusService, buildingService, lotService, gateService, mapService, $routeParams, $location) {
            var self = this;

            // implement checkboxes that control which components (buildings, lots, gates) are displayed on the map
            var campusId = parseInt($routeParams.campusId);
            campusService.getCampuses( function (campuses) {
                self.campus = campuses[campusId];
            });

            self.structureToUpdate = null;

            self.modalModeEnum = {
                ADD: 0,
                EDIT: 1
            };
            self.modalMode = null;

            var overlay;
            var bounds = new google.maps.MVCArray();
            var markers = new google.maps.MVCArray();
            var curType = null;


            self.goBack = function () {
                // will probably have to reset stuff here
                $location.path('/campuses');
            }

            function getBuildings() {
                buildingService.getBuildings(campusId, function (buildings) {
                    self.buildings = buildings;
                    // populate map
                    for (var key in self.buildings) {
                        if (self.buildings.hasOwnProperty(key)) {
                            let building = self.buildings[key];
                            building['markers'] = [];
                            for (let i = 0; i < building.entrances.length; i++) {
                                let entrance = building.entrances[i];
                                building.markers.push(new google.maps.Marker({
                                    position: mapService.convertToGMCoord(entrance),
                                    map: map,
                                    title: building.name
                                }));
                            }
                        }
                    }
                });
            }

            self.saveBuilding = function () {
                if ($("#building-name").val() === '') {
                    // error - name can't be empty
                    return;
                }

                if (markers.getLength() === 0) {
                    // error - should have at least 1 marker
                    return;
                }

                var entrances = [];
                for (var i = 0; i < markers.getLength(); i++) {
                    let coord = markers.getAt(i).getPosition();
                    entrances.push([ coord.lat(), coord.lng() ]);
                }
                console.log(entrances);
                var newBuilding = {
                    name: $("#building-name").val(),
                    active: true,
                    entrances: entrances,
                    markers: []
                };
                if (self.modalMode === self.modalModeEnum.ADD) {
                    buildingService.saveBuilding(campusId, newBuilding, function (response) {
                        if (response) {
                            console.log(response);
                            for (var i = 0; i < newBuilding.entrances.length; i++) {
                                let entrance = newBuilding.entrances[i];
                                newBuilding.markers.push(new google.maps.Marker({
                                    position: mapService.convertToGMCoord(entrance),
                                    map: map,
                                    title: newBuilding.name
                                }));
                            }
                        } else {
                            // error
                            console.log("error");
                        }
                    });
                } else if (self.modalMode === self.modalModeEnum.EDIT) {
                    var oldBuilding = self.buildings[self.structureToUpdate];
                    buildingService.updateBuilding(campusId, self.structureToUpdate, newBuilding, function (response) {
                        if (response) {
                            console.log(response);
                            for (var i = 0; i < oldBuilding.markers.length; i++) {
                                let marker = oldBuilding.markers[i];
                                marker.setMap(null);
                            }
                            oldBuilding.markers = [];

                            for (var i = 0; i < newBuilding.entrances.length; i++) {
                                let entrance = newBuilding.entrances[i];
                                newBuilding.markers.push(new google.maps.Marker({
                                    position: mapService.convertToGMCoord(entrance),
                                    map: map,
                                    title: newBuilding.name
                                }));
                            }
                        } else {
                            // error
                            console.log("error");
                            getBuildings();                            
                        }
                    });
                }

                $('#modal-building').modal('toggle');
            }

            self.deleteBuilding = function (buildingId) {
                var building = self.buildings[buildingId];
                for (var i = 0; i < building.markers.length; i++) {
                    let marker = building.markers[i];
                    marker.setMap(null);
                }
                //building.markers = [];

                buildingService.deleteBuilding(campusId, buildingId, function (response) {
                    if (!response) {
                        // test this

                        // error
                        console.log("error");

                        for (var i = 0; i < building.markers.length; i++) {
                            let marker = building.markers[i];
                            marker.setMap(map);
                        }

                        /*for (var i = 0; i < building.entrances.length; i++) {
                            let entrance = building.entrances[i];
                            building.markers.push(new google.maps.Marker({
                                position: mapService.convertToGMCoord(entrance),
                                map: map,
                                title: building.name
                            }));
                        }*/
                    }
                });
            }

            function getLots() {
                lotService.getLots(campusId, function (lots) {
                    self.lots = lots;
                    // populate map
                    for (var key in self.lots) {
                        if (self.lots.hasOwnProperty(key)) {
                            let lot = self.lots[key];
                            lot['bounds'] = mapService.convertToGMBounds(lot.perimeter);
                            lot['paths'] = mapService.convertToGMPaths(lot.perimeter);
                            lot['markers'] = [];
                            for (let i = 0; i < lot.entrances.length; i++) {
                                let entrance = lot.entrances[i];
                                lot.markers.push(new google.maps.Marker({
                                    position: mapService.convertToGMCoord(entrance),
                                    map: map,
                                    title: lot.name
                                }));
                            }
                            if (lot.perimeter.length > 2) {
                                lot['overlay'] = new google.maps.Polygon({
                                    paths: lot.paths,
                                    draggable: false,
                                    editable: false
                                });
                            } else {
                                lot['overlay'] = new google.maps.Rectangle({
                                    bounds: lot.bounds,
                                    draggable: false,
                                    editable: false
                                });
                            }
                            lot.overlay.setMap(map); 
                        }
                    }
                });
            }

            self.saveLot = function () {

            }

            self.deleteLot = function (lotId) {
                var lot = self.lots[lotId];
                for (var i = 0; i < lot.markers.length; i++) {
                    let marker = lot.markers[i];
                    marker.setMap(null);
                }
                lot.overlay.setMap(null);

                lotService.deleteLot(campusId, lotId, function (response) {
                    if (!response) {
                        // error
                        console.log("error");

                        for (var i = 0; i < lot.markers.length; i++) {
                            let marker = lot.markers[i];
                            marker.setMap(map);
                        }
                        lot.overlay.setMap(map);
                    }
                });
            }

            function getGates() {
                gateService.getGates(campusId, function (gates) {
                    self.gates = gates;
                    // populate map
                    for (var key in self.gates) {
                        if (self.gates.hasOwnProperty(key)) {
                            let gate = self.gates[key];
                            gate['marker'] = new google.maps.Marker({
                                position: mapService.convertToGMCoord(gate.location),
                                map: map,
                                title: gate.name
                            });
                        }
                    }
                });
            }

            self.saveGate = function () {
                if ($("#gate-name").val() === '') {
                    // error - name can't be empty
                    return;
                }

                if (markers.getLength() === 0) {
                    // error - should have 1 marker
                    return;
                }

                var location = [];
                for (var i = 0; i < markers.getLength(); i++) {
                    let coord = markers.getAt(i).getPosition();
                    location.push([ coord.lat(), coord.lng() ]);
                }
                console.log(location);
                var newGate = {
                    name: $("#gate-name").val(),
                    active: true,
                    instructions: $("#gate-instructions").val(),
                    location: location
                };
                if (self.modalMode === self.modalModeEnum.ADD) {
                    buildingService.saveBuilding(campusId, newBuilding, function (response) {
                        if (response) {
                            console.log(response);
                            for (var i = 0; i < newBuilding.entrances.length; i++) {
                                let entrance = newBuilding.entrances[i];
                                newBuilding.markers.push(new google.maps.Marker({
                                    position: mapService.convertToGMCoord(entrance),
                                    map: map,
                                    title: newBuilding.name
                                }));
                            }
                        } else {
                            // error
                            console.log("error");
                        }
                    });
                } else if (self.modalMode === self.modalModeEnum.EDIT) {
                    var oldBuilding = self.buildings[self.structureToUpdate];
                    buildingService.updateBuilding(campusId, self.structureToUpdate, newBuilding, function (response) {
                        if (response) {
                            console.log(response);
                            for (var i = 0; i < oldBuilding.markers.length; i++) {
                                let marker = oldBuilding.markers[i];
                                marker.setMap(null);
                            }
                            oldBuilding.markers = [];

                            for (var i = 0; i < newBuilding.entrances.length; i++) {
                                let entrance = newBuilding.entrances[i];
                                newBuilding.markers.push(new google.maps.Marker({
                                    position: mapService.convertToGMCoord(entrance),
                                    map: map,
                                    title: newBuilding.name
                                }));
                            }
                        } else {
                            // error
                            console.log("error");
                            getGates();                           
                        }
                    });
                }

                $('#modal-gate').modal('toggle');
            }

            self.deleteGate = function (gateId) {
                var gate = self.gates[gateId];
                gate.marker.setMap(null);

                gateService.deleteGate(campusId, gateId, function (response) {
                    if (!response) {
                        // error
                        console.log("error");

                        gate.marker.setMap(map);
                    }
                });
            }

            self.clearModalMap = function () {
                bounds.clear();
                if (overlay) {
                    updateListeners(false);
                    overlay.setMap(null);
                    overlay = null;
                }
                drawingManager.setDrawingMode(null);
                drawingManager.setOptions({
                    drawingControl: true
                });
            }

            var map = new google.maps.Map(document.getElementById('map'), {
                center: self.campus.bounds.getCenter()
            });
            map.fitBounds(self.campus.bounds);

            var modalMapBuilding = new google.maps.Map(document.getElementById('modal-map-building'), {
                center: self.campus.bounds.getCenter()
            });
            modalMapBuilding.fitBounds(self.campus.bounds);  

            var drawingManagerBuilding = new google.maps.drawing.DrawingManager({
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: ['marker']
                },
                markerOptions: {
                    draggable: true
                }
            });
            drawingManagerBuilding.setMap(modalMapBuilding);


            var modalMapLot = new google.maps.Map(document.getElementById('modal-map-lot'), {
                center: self.campus.bounds.getCenter()
            });
            modalMapLot.fitBounds(self.campus.bounds); 

            var drawingManagerLot = new google.maps.drawing.DrawingManager({
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: ['marker', 'rectangle', 'polygon']
                },
                markerOptions: {
                    draggable: true
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
                center: self.campus.bounds.getCenter()
            });
            modalMapGate.fitBounds(self.campus.bounds);

            var drawingManagerGate = new google.maps.drawing.DrawingManager({
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: ['marker']
                },
                markerOptions: {
                    draggable: true
                }
            });
            drawingManagerGate.setMap(modalMapGate);


            function updateBounds() {
                bounds.clear();
                if (curType === 'rectangle') {
                    bounds.push(overlay.getBounds().getNorthEast());
                    bounds.push(overlay.getBounds().getSouthWest());
                } else if (curType === 'polygon') {
                    var path = overlay.getPath();
                    for (var i = 0; i < path.getLength(); i++) {
                        bounds.push(path.getAt(i));
                    }
                }
            }

            function updateListeners(addListeners) {
                if (curType === 'rectangle') {
                    if (addListeners) {
                        google.maps.event.addListener(overlay, 'bounds_changed', function () {
                            updateBounds();
                        });
                    } else {
                        google.maps.event.clearInstanceListeners(overlay);
                    }
                } else if (curType === 'polygon') {
                    var path = overlay.getPath();
                    if (addListeners) {
                        google.maps.event.addListener(path, 'insert_at', function () {
                            updateBounds();
                        });
                        google.maps.event.addListener(path, 'remove_at', function () {
                            updateBounds();
                        });
                        google.maps.event.addListener(path, 'set_at', function () {
                            updateBounds();
                        });
                    } else {
                        google.maps.event.clearInstanceListeners(path);
                    }                    
                }
            }


            google.maps.event.addListener(drawingManagerBuilding, 'markercomplete', function(marker) {
                markers.push(marker);
                //curType = 'marker';
                //updateBounds();
                //updateListeners(true);
            });

            google.maps.event.addListener(drawingManagerLot, 'overlaycomplete', function(event) {
                overlay = event.overlay;
                curType = event.type;
                updateBounds();
                updateListeners(true);
                drawingManager.setDrawingMode(null);
                drawingManager.setOptions({
                    drawingControl: false
                });
            });

            /*
            google.maps.event.addListener(drawingManagerGate, 'overlaycomplete', function(event) {
                overlay = event.overlay;
                curType = event.type;
                updateBounds();
                updateListeners(true);
                drawingManager.setDrawingMode(null);
                drawingManager.setOptions({
                    drawingControl: false
                });
            });*/

            $("#modal-building").on("shown.bs.modal", function () {
                google.maps.event.trigger(modalMapBuilding, 'resize');
                drawingManagerBuilding.setDrawingMode(null);
                modalMapBuilding.fitBounds(self.campus.bounds);
                if (self.modalMode === self.modalModeEnum.ADD) {
                    drawingManagerBuilding.setOptions({
                        drawingControl: true
                    });
                } else if (self.modalMode === self.modalModeEnum.EDIT) {
                    var building = self.buildings[self.structureToUpdate];
                    $("#building-name").val(building.name);
                    //curType = 'marker';
                    for (var i = 0; i < building.entrances.length; i++) {
                        let entrance = building.entrances[i];
                        markers.push(new google.maps.Marker({
                            position: mapService.convertToGMCoord(entrance),
                            map: modalMapBuilding,
                            draggable: true,
                            title: building.name
                        }));
                    }
                    //updateListeners(true);   
                }
            });

            $("#modal-building").on("hidden.bs.modal", function () {
                $("#building-name").val("");
                for (var i = 0; i < markers.getLength(); i++) {
                    let marker = markers.getAt(i);
                    marker.setMap(null);
                }
                markers.clear();
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

            getBuildings();
            getLots();
            getGates();
        }]);
})();