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
                    shuttleService: function(shuttleService) {
                        return shuttleService;
                    },
                    mapService: function(mapService) {
                        return mapService;
                    },
                    loginService: function(loginService) {
                        return loginService;
                    }
                }
            });
        }])
        .controller('CampusCtrl', ['campusService', 'buildingService', 'lotService', 'gateService', 'shuttleService', 'mapService', 'loginService', '$routeParams', '$scope', '$location', function(campusService, buildingService, lotService, gateService, shuttleService, mapService, loginService, $routeParams, $scope, $location) {
            var self = this;

            if (!loginService.userIsLoggedIn()) {
                $location.path('/login');
            }

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

            self.selectedRoles = [];
            self.selectedBuildings = [];
            self.instructions = [];

            self.shuttles = { }; // temp
            var shuttleId = 1; // temp

            self.shuttleStops = [];

            var overlay;
            var bounds = new google.maps.MVCArray();
            var markers = new google.maps.MVCArray();
            var curType = null;

            var buildingIcon = 'images/buildingIcon.png';
            var lotIcon = 'images/lotIcon.png';
            var gateIcon = 'images/gateIcon.png';

            self.logout = function () {
                loginService.logout();
                $location.path('/login');
            }

            self.goBack = function () {
                $location.path('/campuses');
            }

            function updateShuttleStops(add, len) {
                // loop through path, check equal to element in bounds array
                // if so then either add or remove that element from array

                if (add) {
                    for (var i = 0; i < len; i++) {
                        var stopTime = new Date();
                        stopTime.setHours(0);
                        stopTime.setMinutes(0);

                        self.shuttleStops.push({
                            stopTime: stopTime
                        });
                    }
                } else {
                    self.shuttleStops.pop();
                }
            }

            self.updateInstructions = function () {
                var editMode = self.modalMode === self.modalModeEnum.EDIT;
                
                for (var i = 0; i < self.instructions.length; i++) {
                    let roleId = self.instructions[i].role.id;
                    let found = false;
                    for (var j = 0; j < self.selectedRoles.length; j++) {
                        let role = self.selectedRoles[j];
                        if (role.id === roleId) {
                            let command = '';
                            if (editMode) {
                                let gate = self.gates[self.structureToUpdate];
                                command = gate.instructions[i][1];
                                if (command === null) {
                                    command = '';
                                }
                            }
                            self.instructions[i].command = command;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        self.instructions[i].command = null;
                    }
                }
            }

            // structure can be only a lot
            function updateBuildingNames(lot) {
                lot['buildingNames'] = '';
                for (let i = 0; i < lot.buildings.length; i++) {
                    let buildingId = lot.buildings[i];
                    lot.buildingNames += self.buildings[buildingId].name + ', ';
                }
                if (lot.buildingNames.length >= 2) {
                    lot.buildingNames = lot.buildingNames.slice(0, -2);
                }
            }

            // structure can be a lot or a gate
            function updateAccessNames(structure) {
                structure['accessNames'] = '';
                for (let i = 0; i < structure.access.length; i++) {
                    let roleId = structure.access[i];
                    for (let j = 0; j < self.campus.roles.length; j++) {
                        let role = self.campus.roles[j];
                        if (role.id === roleId) {
                            structure.accessNames += role.name + ', ';
                        }
                    }
                }
                if (structure.accessNames.length >= 2) {
                    structure.accessNames = structure.accessNames.slice(0, -2);
                }
            }

            function resetDates() {
                self.fromTime = new Date();
                self.fromTime.setHours(0);
                self.fromTime.setMinutes(0);

                self.toTime = new Date();
                self.toTime.setHours(0);
                self.toTime.setMinutes(0);
            }

            function convertTimeToString(d) {
                var hours = d.getHours().toString();
                var minutes = d.getMinutes().toString();
                if (hours.length === 1) {
                    hours = '0' + hours;
                }
                if (minutes.length === 1) {
                    minutes = '0' + minutes;
                }
                return hours + ':' + minutes;
            }

            function getBuildings() {
                buildingService.getBuildings(campusId, function (buildings) {
                    self.buildings = buildings;
                    self.buildingsAry = Object.keys(buildings).map(function (buildingId) { return buildings[buildingId]; });
                    //self.campus['buildings'] = buildingsAry;
                    //console.log(self.buildingsAry);
                    // populate map
                    for (var key in self.buildings) {
                        if (self.buildings.hasOwnProperty(key)) {
                            let building = self.buildings[key];
                            building['id'] = Number(key); // need to do this b/c of ng-options
                            building['markers'] = [];
                            for (let i = 0; i < building.entrances.length; i++) {
                                let entrance = building.entrances[i];
                                building.markers.push(new google.maps.Marker({
                                    position: mapService.convertToGMCoord(entrance),
                                    map: map,
                                    title: building.name,
                                    icon: buildingIcon
                                }));
                            }
                        }
                    }
                    // lots rely on buildings
                    getLots();
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
                                    title: newBuilding.name,
                                    icon: buildingIcon
                                }));
                            }
                            newBuilding['id'] = Number(response); // need to do this b/c of ng-options
                            self.buildingsAry.push(newBuilding);
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
                                    title: newBuilding.name,
                                    icon: buildingIcon
                                }));
                            }

                            for (var i = 0; i < self.buildingsAry.length; i++) {
                                let building = self.buildingsAry[i];
                                if (building.id === newBuilding.id) {
                                    self.buildingsAry[i] = newBuilding;
                                    break;
                                }
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
                                title: building.name,
                                icon: buildingIcon
                            }));
                        }*/
                    } else {
                        for (var i = 0; i < self.lots.length; i++) {
                            let lot = self.lots[i];
                            let index = lot.buildings.indexOf(buildingId);
                            if (index > -1) {
                                lot.buildings.splice(index, 1);
                            }
                        }

                        for (var i = 0; i < self.buildingsAry.length; i++) {
                            let _building = self.buildingsAry[i];
                            if (_building.id === building.id) {
                                self.buildingsAry.splice(i, 1);
                                break;
                            }
                        }
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

                            updateBuildingNames(lot);
                            updateAccessNames(lot);

                            lot['bounds'] = mapService.convertToGMBounds(lot.perimeter);
                            lot['paths'] = mapService.convertToGMPaths(lot.perimeter);
                            lot['markers'] = [];
                            for (let i = 0; i < lot.entrances.length; i++) {
                                let entrance = lot.entrances[i];
                                lot.markers.push(new google.maps.Marker({
                                    position: mapService.convertToGMCoord(entrance),
                                    map: map,
                                    title: lot.name,
                                    icon: lotIcon
                                }));
                            }
                            if (lot.perimeter.length > 2) {
                                lot['overlay'] = new google.maps.Polygon({
                                    paths: lot.paths,
                                    draggable: false,
                                    editable: false,
                                    fillColor: '#7CFC00',
                                    fillOpacity: 0.35
                                });
                            } else {
                                lot['overlay'] = new google.maps.Rectangle({
                                    bounds: lot.bounds,
                                    draggable: false,
                                    editable: false,
                                    fillColor: '#7CFC00',
                                    fillOpacity: 0.35
                                });
                            }
                            lot.overlay.setMap(map); 
                        }
                    }
                });
            }

            self.saveLot = function () {
                if ($("#lot-name").val() === '') {
                    // error - name can't be empty
                    return;
                }

                if (markers.getLength() === 0) {
                    // error - should have at least 1 marker
                    return;
                }

                if (self.selectedRoles.length === 0) {
                    // error - should have at least 1 role selected
                    return;
                }

                if (bounds.getLength() === 0) {
                    // error - need to draw something
                    return;
                }

                if (curType === 'polygon' && bounds.getLength() <= 2) {
                    // error - should have at least 3 points
                    return;
                }

                var start = convertTimeToString(self.fromTime);
                var end = convertTimeToString(self.toTime);

                console.log("Selected buildings:");
                console.log(self.selectedBuildings);
                var buildings = [];
                for (var i = 0; i < self.selectedBuildings.length; i++) {
                    let building = self.selectedBuildings[i];
                    /*if (isNaN(building)) {
                        console.log("not a number");
                        buildings.push(building.id);
                    } else {
                        console.log("YES a number");
                        buildings.push(building);
                    }*/
                    buildings.push(building.id);
                }

                var roles = [];
                for (var i = 0; i < self.selectedRoles.length; i++) {
                    let role = self.selectedRoles[i];
                    roles.push(role.id);
                }

                var perimeter = [];
                for (var i = 0; i < bounds.getLength(); i++) {
                    let coord = bounds.getAt(i);
                    perimeter.push([ coord.lat(), coord.lng() ]);
                }

                var entrances = [];
                for (var i = 0; i < markers.getLength(); i++) {
                    let coord = markers.getAt(i).getPosition();
                    entrances.push([ coord.lat(), coord.lng() ]);
                }
                var newLot = {
                    name: $("#lot-name").val(),
                    active: true,
                    buildings: buildings,
                    access: roles,
                    start: start,
                    end: end,
                    perimeter: perimeter,
                    entrances: entrances,
                    markers: []
                };
                if (self.modalMode === self.modalModeEnum.ADD) {
                    //console.log(Object.keys(newLot));
                    //console.log(newLot);
                    lotService.saveLot(campusId, newLot, function (response) {
                        if (response) {
                            console.log(response);
                            newLot['bounds'] = mapService.convertToGMBounds(newLot.perimeter);
                            newLot['paths'] = mapService.convertToGMPaths(newLot.perimeter);

                            updateBuildingNames(newLot);
                            updateAccessNames(newLot);

                            for (var i = 0; i < newLot.entrances.length; i++) {
                                let entrance = newLot.entrances[i];
                                newLot.markers.push(new google.maps.Marker({
                                    position: mapService.convertToGMCoord(entrance),
                                    map: map,
                                    title: newLot.name,
                                    icon: lotIcon
                                }));
                            }
                            if (newLot.perimeter.length > 2) {
                                newLot['overlay'] = new google.maps.Polygon({
                                    paths: newLot.paths,
                                    draggable: false,
                                    editable: false,
                                    fillColor: '#7CFC00',
                                    fillOpacity: 0.35
                                });
                            } else {
                                newLot['overlay'] = new google.maps.Rectangle({
                                    bounds: newLot.bounds,
                                    draggable: false,
                                    editable: false,
                                    fillColor: '#7CFC00',
                                    fillOpacity: 0.35
                                });
                            }
                            newLot.overlay.setMap(map); 
                        } else {
                            // error
                            console.log("error");
                        }
                    });
                } else if (self.modalMode === self.modalModeEnum.EDIT) {
                    var oldLot = self.lots[self.structureToUpdate];
                    lotService.updateLot(campusId, self.structureToUpdate, newLot, function (response) {
                        if (response) {
                            console.log(response);
                            newLot['bounds'] = mapService.convertToGMBounds(newLot.perimeter);
                            newLot['paths'] = mapService.convertToGMPaths(newLot.perimeter);

                            updateBuildingNames(newLot);
                            updateAccessNames(newLot);

                            for (var i = 0; i < oldLot.markers.length; i++) {
                                let marker = oldLot.markers[i];
                                marker.setMap(null);
                            }
                            oldLot.markers = [];

                            for (var i = 0; i < newLot.entrances.length; i++) {
                                let entrance = newLot.entrances[i];
                                newLot.markers.push(new google.maps.Marker({
                                    position: mapService.convertToGMCoord(entrance),
                                    map: map,
                                    title: newLot.name,
                                    icon: lotIcon
                                }));
                            }

                            oldLot.overlay.setMap(null);

                            if (newLot.perimeter.length > 2) {
                                newLot['overlay'] = new google.maps.Polygon({
                                    paths: newLot.paths,
                                    draggable: false,
                                    editable: false,
                                    fillColor: '#7CFC00',
                                    fillOpacity: 0.35
                                });
                            } else {
                                newLot['overlay'] = new google.maps.Rectangle({
                                    bounds: newLot.bounds,
                                    draggable: false,
                                    editable: false,
                                    fillColor: '#7CFC00',
                                    fillOpacity: 0.35
                                });
                            }
                            newLot.overlay.setMap(map);
                        } else {
                            // error
                            console.log("error");
                            getLots();                          
                        }
                    });
                }

                $('#modal-lot').modal('toggle');
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

                            var access = [];
                            for (var i = 0; i < gate.tempAccess.length; i++) {
                                let roleId = gate.tempAccess[i][0];
                                access.push(roleId);
                            }
                            gate['access'] = access;

                            updateAccessNames(gate);

                            var instructions = [];
                            for (var i = 0; i < self.campus.roles.length; i++) {
                                let role = self.campus.roles[i];
                                let index = gate.access.indexOf(role.id);
                                if (index > -1) {
                                    let command = gate.tempAccess[index][1];
                                    instructions.push([role.id, command]);
                                } else {
                                    instructions.push([role.id, null]);
                                }
                            }
                            gate['instructions'] = instructions;

                            gate['marker'] = new google.maps.Marker({
                                position: mapService.convertToGMCoord(gate.location[0]),
                                map: map,
                                title: gate.name,
                                icon: gateIcon
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

                if (self.selectedRoles.length === 0) {
                    // error - should have at least 1 role selected
                    return;
                }

                var start = convertTimeToString(self.fromTime);
                var end = convertTimeToString(self.toTime);

                var roles = [];
                for (var i = 0; i < self.selectedRoles.length; i++) {
                    let role = self.selectedRoles[i];
                    /*for (var j = 0; j < self.instructions.length; j++) {
                        let instruction = self.instructions[j];
                        if (instruction.role.id === role.id && instruction.command === '') {
                            return;
                        } 
                    }*/
                    roles.push(role.id);
                }

                var instructions = [];
                for (var i = 0; i < self.instructions.length; i++) {
                    let instruction = self.instructions[i];
                    /*let command = instruction.command;
                    if (command === null) {
                        command = '';
                    }*/
                    instructions.push([instruction.role.id, instruction.command]);
                }

                var location = [];
                for (var i = 0; i < markers.getLength(); i++) {
                    let coord = markers.getAt(i).getPosition();
                    location.push([ coord.lat(), coord.lng() ]);
                }

                var newGate = {
                    name: $("#gate-name").val(),
                    active: true,
                    access: roles,
                    start: start,
                    end: end,
                    instructions: instructions,
                    location: location
                };
                if (self.modalMode === self.modalModeEnum.ADD) {
                    gateService.saveGate(campusId, newGate, function (response) {
                        if (response) {
                            console.log(response);

                            updateAccessNames(newGate);

                            newGate['marker'] = new google.maps.Marker({
                                position: mapService.convertToGMCoord(newGate.location[0]),
                                map: map,
                                title: newGate.name,
                                icon: gateIcon
                            });
                        } else {
                            // error
                            console.log("error");
                        }
                    });
                } else if (self.modalMode === self.modalModeEnum.EDIT) {
                    var oldGate = self.gates[self.structureToUpdate];
                    gateService.updateGate(campusId, self.structureToUpdate, newGate, function (response) {
                        if (response) {
                            console.log(response);

                            updateAccessNames(newGate);

                            oldGate.marker.setMap(null);
                            newGate['marker'] = new google.maps.Marker({
                                position: mapService.convertToGMCoord(newGate.location[0]),
                                map: map,
                                title: newGate.name,
                                icon: gateIcon
                            });
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





            function getShuttles() {
                shuttleService.getShuttles(campusId, function (shuttles) {
                    self.shuttles = shuttles;
                    // populate map
                    for (var key in self.shuttles) {
                        if (self.shuttles.hasOwnProperty(key)) {
                            let shuttle = self.shuttles[key];

                            shuttle['bounds'] = mapService.convertToGMBounds(shuttle.perimeter);
                            shuttle['paths'] = mapService.convertToGMPaths(shuttle.perimeter);

                            shuttle['overlay'] = new google.maps.Polyline({
                                path: shuttle.paths,
                                draggable: false,
                                editable: false,
                                strokeColor: '#FFA500',
                                strokeOpacity: 1.0
                            });
                            shuttle.overlay.setMap(map); 
                        }
                    }
                });
            }

            self.saveShuttle = function () {
                if ($("#shuttle-name").val() === '') {
                    // error - name can't be empty
                    return;
                }

                if (bounds.getLength() === 0) {
                    // error - need to draw something
                    return;
                }

                var start = convertTimeToString(self.fromTime);
                var end = convertTimeToString(self.toTime);

                var perimeter = [];
                for (var i = 0; i < bounds.getLength(); i++) {
                    let coord = bounds.getAt(i);
                    perimeter.push([ coord.lat(), coord.lng() ]);
                }

                var newShuttle = {
                    name: $("#shuttle-name").val(),
                    active: true,
                    start: start,
                    end: end,
                    perimeter: perimeter,
                    shuttleStops: self.shuttleStops,
                    stopsCount: self.shuttleStops.length
                };

                if (self.modalMode === self.modalModeEnum.ADD) {
                    newShuttle['id'] = shuttleId;
                    shuttleId++; // temp

                    newShuttle['bounds'] = mapService.convertToGMBounds(newShuttle.perimeter);
                    newShuttle['paths'] = mapService.convertToGMPaths(newShuttle.perimeter);

                    newShuttle['overlay'] = new google.maps.Polyline({
                        path: newShuttle.paths,
                        draggable: false,
                        editable: false,
                        strokeColor: '#FFA500',
                        strokeOpacity: 1.0
                    });

                    newShuttle.overlay.setMap(map);

                    self.shuttles[newShuttle.id] = newShuttle;

                    /*shuttleService.saveShuttle(campusId, newShuttle, function (response) {
                        if (response) {
                            console.log(response);
                            newShuttle['bounds'] = mapService.convertToGMBounds(newShuttle.perimeter);
                            newShuttle['paths'] = mapService.convertToGMPaths(newShuttle.perimeter);

                            newShuttle['overlay'] = new google.maps.Polyline({
                                path: newShuttle.paths,
                                draggable: false,
                                editable: false,
                                strokeColor: '#FFA500',
                                strokeOpacity: 1.0
                            });

                            newShuttle.overlay.setMap(map); 
                        } else {
                            // error
                            console.log("error");
                        }
                    });*/
                } else if (self.modalMode === self.modalModeEnum.EDIT) {
                    var oldShuttle = self.shuttles[self.structureToUpdate];
                    /*shuttleService.updateShuttle(campusId, self.structureToUpdate, newShuttle, function (response) {
                        if (response) {
                            console.log(response);
                            newShuttle['bounds'] = mapService.convertToGMBounds(newShuttle.perimeter);
                            newShuttle['paths'] = mapService.convertToGMPaths(newShuttle.perimeter);

                            oldShuttle.overlay.setMap(null);

                            newShuttle['overlay'] = new google.maps.Polyline({
                                path: newShuttle.paths,
                                draggable: false,
                                editable: false,
                                strokeColor: '#FFA500',
                                strokeOpacity: 1.0
                            });

                            newShuttle.overlay.setMap(map);
                        } else {
                            // error
                            console.log("error");
                            getShuttles();
                        }
                    });*/
                    newShuttle['bounds'] = mapService.convertToGMBounds(newShuttle.perimeter);
                    newShuttle['paths'] = mapService.convertToGMPaths(newShuttle.perimeter);

                    oldShuttle.overlay.setMap(null);

                    newShuttle['overlay'] = new google.maps.Polyline({
                        path: newShuttle.paths,
                        draggable: false,
                        editable: false,
                        strokeColor: '#FFA500',
                        strokeOpacity: 1.0
                    });

                    newShuttle.overlay.setMap(map);
                }

                $('#modal-shuttle').modal('toggle');
            }

            self.deleteShuttle = function (shuttleId) {
                var shuttle = self.shuttles[shuttleId];
                shuttle.overlay.setMap(null);

                delete self.shuttles[shuttleId];

                /*shuttleService.deleteShuttle(campusId, shuttleId, function (response) {
                    if (!response) {
                        // error
                        console.log("error");

                        shuttle.overlay.setMap(map);
                    }
                });*/
            }




            self.clearModalMap = function () {
                bounds.clear();
                if (overlay) {
                    updateListeners(false);
                    overlay.setMap(null);
                    overlay = null;
                }
                drawingManagerLot.setDrawingMode(null);
                drawingManagerLot.setOptions({
                    drawingControlOptions: {
                        drawingModes: ['marker', 'rectangle', 'polygon']
                    }
                });
                drawingManagerShuttle.setDrawingMode(null);
                drawingManagerShuttle.setOptions({
                    drawingControlOptions: {
                        drawingModes: ['polyline']
                    }
                });
                self.clearMarkers();
            }

            self.clearMarkers = function () {
                for (var i = 0; i < markers.getLength(); i++) {
                    let marker = markers.getAt(i);
                    marker.setMap(null);
                }
                markers.clear();
            }

            var map = new google.maps.Map(document.getElementById('map'), {
                center: self.campus.bounds.getCenter(),
                mapTypeId: 'satellite'
            });
            map.fitBounds(self.campus.bounds);

            var modalMapBuilding = new google.maps.Map(document.getElementById('modal-map-building'), {
                center: self.campus.bounds.getCenter(),
                mapTypeId: 'satellite'
            });
            modalMapBuilding.fitBounds(self.campus.bounds);  

            var drawingManagerBuilding = new google.maps.drawing.DrawingManager({
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: ['marker']
                },
                markerOptions: {
                    draggable: true,
                    icon: buildingIcon
                }
            });
            drawingManagerBuilding.setMap(modalMapBuilding);


            var modalMapLot = new google.maps.Map(document.getElementById('modal-map-lot'), {
                center: self.campus.bounds.getCenter(),
                mapTypeId: 'satellite'
            });
            modalMapLot.fitBounds(self.campus.bounds); 

            var drawingManagerLot = new google.maps.drawing.DrawingManager({
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: ['marker', 'rectangle', 'polygon']
                },
                markerOptions: {
                    draggable: true,
                    icon: lotIcon
                },
                rectangleOptions: {
                    draggable: true,
                    editable: true,
                    fillColor: '#7CFC00',
                    fillOpacity: 0.35
                },
                polygonOptions: {
                    draggable: true,
                    editable: true,
                    fillColor: '#7CFC00',
                    fillOpacity: 0.35
                }
            });
            drawingManagerLot.setMap(modalMapLot);


            var modalMapGate = new google.maps.Map(document.getElementById('modal-map-gate'), {
                center: self.campus.bounds.getCenter(),
                mapTypeId: 'satellite'
            });
            modalMapGate.fitBounds(self.campus.bounds);

            var drawingManagerGate = new google.maps.drawing.DrawingManager({
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: ['marker']
                },
                markerOptions: {
                    draggable: true,
                    icon: gateIcon
                }
            });
            drawingManagerGate.setMap(modalMapGate);


            var modalMapShuttle = new google.maps.Map(document.getElementById('modal-map-shuttle'), {
                center: self.campus.bounds.getCenter(),
                mapTypeId: 'satellite'
            });
            modalMapShuttle.fitBounds(self.campus.bounds);

            var drawingManagerShuttle = new google.maps.drawing.DrawingManager({
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: ['polyline']
                },
                polylineOptions: {
                    draggable: true,
                    editable: true,
                    strokeColor: '#FFA500',
                    strokeOpacity: 1.0
                }
            });
            drawingManagerShuttle.setMap(modalMapShuttle);


            function updateBounds() {
                bounds.clear();
                if (curType === 'rectangle') {
                    bounds.push(overlay.getBounds().getNorthEast());
                    bounds.push(overlay.getBounds().getSouthWest());
                } else if (curType === 'polygon' || curType === 'polyline') {
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
                } else if (curType === 'polygon' || curType === 'polyline') {
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
            });

            google.maps.event.addListener(drawingManagerGate, 'markercomplete', function(marker) {
                markers.push(marker);
                drawingManagerGate.setDrawingMode(null);
                drawingManagerGate.setOptions({
                    drawingControl: false
                });
            });

            google.maps.event.addListener(drawingManagerLot, 'overlaycomplete', function(event) {
                if (event.type === 'marker') {
                    markers.push(event.overlay);
                } else {
                    overlay = event.overlay;
                    curType = event.type;
                    updateBounds();
                    updateListeners(true);
                    drawingManagerLot.setDrawingMode(null);
                    drawingManagerLot.setOptions({
                        drawingControlOptions: {
                            drawingModes: ['marker']
                        }
                    });
                }
            });

            google.maps.event.addListener(drawingManagerShuttle, 'overlaycomplete', function(event) {
                overlay = event.overlay;
                curType = event.type;
                updateBounds();
                updateListeners(true);
                drawingManagerShuttle.setDrawingMode(null);
                drawingManagerShuttle.setOptions({
                    drawingControl: false
                });
                updateShuttleStops(true, bounds.getLength()-1);
                $scope.$apply();
            });

            $("#modal-building").on("shown.bs.modal", function () {
                google.maps.event.trigger(modalMapBuilding, 'resize');
                drawingManagerBuilding.setDrawingMode(null);
                modalMapBuilding.fitBounds(self.campus.bounds);
                if (self.modalMode === self.modalModeEnum.EDIT) {
                    var building = self.buildings[self.structureToUpdate];
                    $("#building-name").val(building.name);
                    for (var i = 0; i < building.entrances.length; i++) {
                        let entrance = building.entrances[i];
                        markers.push(new google.maps.Marker({
                            position: mapService.convertToGMCoord(entrance),
                            map: modalMapBuilding,
                            draggable: true,
                            title: building.name,
                            icon: buildingIcon
                        }));
                    }
                }
            });

            $("#modal-building").on("hidden.bs.modal", function () {
                $("#building-name").val("");
                self.clearMarkers();
            });

            $("#modal-lot").on("shown.bs.modal", function () {
                google.maps.event.trigger(modalMapLot, 'resize');
                drawingManagerLot.setDrawingMode(null);
                modalMapLot.fitBounds(self.campus.bounds);
                if (self.modalMode === self.modalModeEnum.ADD) {
                    drawingManagerLot.setOptions({
                        drawingControlOptions: {
                            drawingModes: ['marker', 'rectangle', 'polygon']
                        }
                    });
                } else if (self.modalMode === self.modalModeEnum.EDIT) {
                    var lot = self.lots[self.structureToUpdate];
                    $("#lot-name").val(lot.name);

                    /*for (var buildingId in self.buildings) {
                        let building = self.buildings[buildingId];
                        let index = lot.buildings.indexOf(building.id);
                        if (index > -1) {
                            self.selectedBuildings.push(building);
                        }
                    }*/

                    for (var i = 0; i < self.buildingsAry.length; i++) {
                        let building = self.buildingsAry[i];
                        let index = lot.buildings.indexOf(building.id);
                        if (index > -1) {
                            self.selectedBuildings.push(building);
                        }
                    }

                    for (var i = 0; i < self.campus.roles.length; i++) {
                        let role = self.campus.roles[i];
                        let index = lot.access.indexOf(role.id);
                        if (index > -1) {
                            self.selectedRoles.push(role);
                        }
                    }

                    var start = lot.start.split(':');
                    self.fromTime = new Date();
                    self.fromTime.setHours(Number(start[0]));
                    self.fromTime.setMinutes(Number(start[1]));

                    var end = lot.end.split(':');
                    self.toTime = new Date();
                    self.toTime.setHours(Number(end[0]));
                    self.toTime.setMinutes(Number(end[1]));

                    if (lot.perimeter.length > 2) {
                        curType = 'polygon';
                        overlay = new google.maps.Polygon({
                            paths: lot.paths,
                            draggable: true,
                            editable: true,
                            fillColor: '#7CFC00',
                            fillOpacity: 0.35
                        });
                    } else {
                        curType = 'rectangle';
                        overlay = new google.maps.Rectangle({
                            bounds: lot.bounds,
                            draggable: true,
                            editable: true,
                            fillColor: '#7CFC00',
                            fillOpacity: 0.35
                        });
                    }
                    overlay.setMap(modalMapLot);

                    for (var i = 0; i < lot.entrances.length; i++) {
                        let entrance = lot.entrances[i];
                        markers.push(new google.maps.Marker({
                            position: mapService.convertToGMCoord(entrance),
                            map: modalMapLot,
                            draggable: true,
                            title: lot.name,
                            icon: lotIcon
                        }));
                    }

                    updateBounds();
                    updateListeners(true);
                    drawingManagerLot.setOptions({
                        drawingControlOptions: {
                            drawingModes: ['marker']
                        }
                    });
                    $scope.$apply();
                }
            });

            $("#modal-lot").on("hidden.bs.modal", function () {
                $("#lot-name").val("");
                self.clearMarkers();
                self.selectedRoles = [];
                self.selectedBuildings = [];
                resetDates();
                bounds.clear();
                if (overlay) {
                    updateListeners(false);
                    overlay.setMap(null);
                    overlay = null;
                }
            });

            $("#modal-gate").on("shown.bs.modal", function () {
                google.maps.event.trigger(modalMapGate, 'resize');
                drawingManagerGate.setDrawingMode(null);
                modalMapGate.fitBounds(self.campus.bounds);
                
                if (self.modalMode === self.modalModeEnum.ADD) {
                    drawingManagerGate.setOptions({
                        drawingControl: true
                    });
                    for (var i = 0; i < self.campus.roles.length; i++) {
                        let role = self.campus.roles[i];
                        self.instructions.push({'role': role, 'command': null})
                    }
                } else if (self.modalMode === self.modalModeEnum.EDIT) {
                    var gate = self.gates[self.structureToUpdate];
                    $("#gate-name").val(gate.name);
                    //$("#gate-instructions").val(gate.instructions);
                    /*for (var i = 0; i < gate.instructions.length; i++) {
                        let instruction = gate.instructions[i];
                        self.instructions.push({'command': instruction});
                    }*/

                    for (var i = 0; i < self.campus.roles.length; i++) {
                        let role = self.campus.roles[i];
                        let index = gate.access.indexOf(role.id);
                        if (index > -1) {
                            self.selectedRoles.push(role);
                        }
                        self.instructions.push({'role': role, 'command': gate.instructions[i][1]})
                    }

                    var start = gate.start.split(':');
                    self.fromTime = new Date();
                    self.fromTime.setHours(Number(start[0]));
                    self.fromTime.setMinutes(Number(start[1]));

                    var end = gate.end.split(':');
                    self.toTime = new Date();
                    self.toTime.setHours(Number(end[0]));
                    self.toTime.setMinutes(Number(end[1]));


                    markers.push(new google.maps.Marker({
                        position: mapService.convertToGMCoord(gate.location[0]),
                        map: modalMapGate,
                        draggable: true,
                        title: gate.name,
                        icon: gateIcon
                    }));
                    drawingManagerGate.setOptions({
                        drawingControl: false
                    });
                    $scope.$apply();
                }
            });

            $("#modal-gate").on("hidden.bs.modal", function () {
                $("#gate-name").val("");
                $("#gate-instructions").val("");
                self.clearMarkers();
                self.selectedRoles = [];
                self.instructions = [];
                resetDates();
            });


            $("#modal-shuttle").on("shown.bs.modal", function () {
                google.maps.event.trigger(modalMapShuttle, 'resize');
                drawingManagerShuttle.setDrawingMode(null);
                modalMapShuttle.fitBounds(self.campus.bounds);
                if (self.modalMode === self.modalModeEnum.ADD) {
                    drawingManagerShuttle.setOptions({
                        drawingControlOptions: {
                            drawingModes: ['polyline']
                        }
                    });
                } else if (self.modalMode === self.modalModeEnum.EDIT) {
                    var shuttle = self.shuttles[self.structureToUpdate];
                    $("#shuttle-name").val(shuttle.name);

                    var start = shuttle.start.split(':');
                    self.fromTime = new Date();
                    self.fromTime.setHours(Number(start[0]));
                    self.fromTime.setMinutes(Number(start[1]));

                    var end = shuttle.end.split(':');
                    self.toTime = new Date();
                    self.toTime.setHours(Number(end[0]));
                    self.toTime.setMinutes(Number(end[1]));

                    // need stop time in here
                    //for (var i = 0; i < shuttle)

                    curType = 'polyline';
                    overlay = new google.maps.Polyline({
                        path: shuttle.paths,
                        draggable: true,
                        editable: true,
                        strokeColor: '#FFA500',
                        strokeOpacity: 1.0
                    });

                    overlay.setMap(modalMapShuttle);

                    updateBounds();
                    updateListeners(true);

                    $scope.$apply();
                }
            });

            $("#modal-shuttle").on("hidden.bs.modal", function () {
                $("#shuttle-name").val("");
                resetDates();
                bounds.clear();
                self.shuttleStops = [];
                if (overlay) {
                    updateListeners(false);
                    overlay.setMap(null);
                    overlay = null;
                }
            });

            resetDates();
            getBuildings();
            getGates();
            //getShuttles();
        }]);
})();