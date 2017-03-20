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
                    campusService: function(campusService) {
                        return campusService;
                    },
                    roleService: function(roleService) {
                        return roleService;
                    },
                    mapService: function(mapService) {
                        return mapService;
                    }
                }
            });
        }])
        .controller('CampusesCtrl', ['campusService', 'roleService', 'mapService', '$uibModal', '$scope', function (campusService, roleService, mapService, $uibModal, $scope) {
            var self = this;

            self.campusToUpdate = null;

            self.modalModeEnum = {
                ADD: 0,
                EDIT: 1
            };
            self.modalMode = null;

            self.roles = [];

            var USA_CENTER = {lat: 38.0902, lng: -95.7129};
            var DEFAULT_ZOOM = 4;

            var overlay;
            var bounds = new google.maps.MVCArray();
            var curType = null;

            self.addRole = function () {
                self.roles.push({
                    name: ''
                });
            }

            function getCampuses() {
                campusService.getCampuses(function (campuses) {
                    self.campuses = campuses;
                    // populate map
                    for (var key in self.campuses) {
                        if (self.campuses.hasOwnProperty(key)) {
                            let campus = self.campuses[key];
                            campus['bounds'] = mapService.convertToGMBounds(campus.perimeter);
                            campus['paths'] = mapService.convertToGMPaths(campus.perimeter);
                            campus['marker'] = new google.maps.Marker({
                                position: campus.bounds.getCenter(),
                                map: map,
                                title: campus.name
                            });
                            roleService.getRoles(key, function (roles) {
                                campus['roles'] = roles;
                            });
                        }
                    }
                });
            }

            self.saveCampus = function () {
                console.log("were here");
                if ($("#name").val() === '') {
                    // error - name can't be empty
                    console.log("0");
                    return;
                }

                if (self.roles.length === 0) {
                    // error - need at least 1 role
                    console.log("1");
                    return;
                }

                for (var i = 0; i < self.roles.length; i++) {
                    let role = self.roles[i];
                    if (role.name === '') {
                        // error - needs a name
                        console.log("2");
                        console.log(role);
                        return;
                    }
                }

                if (bounds.getLength() === 0) {
                    // error - need to draw something
                    console.log("3");
                    return;
                }

                if (curType === 'polygon' && bounds.getLength() <= 2) {
                    // error - should have at least 3 points
                    console.log("4");
                    return;
                }

                var perimeter = [];
                for (var i = 0; i < bounds.getLength(); i++) {
                    let coord = bounds.getAt(i);
                    perimeter.push([ coord.lat(), coord.lng() ]);
                }
                console.log(perimeter);
                var newCampus = {
                    name: $("#name").val(),
                    active: true,
                    perimeter: perimeter
                };
                if (self.modalMode === self.modalModeEnum.ADD) {
                    campusService.saveCampus(newCampus, function (response) {
                        if (response) {
                            roleService.saveRoles(response, self.roles, function (roles) {
                                if (roles) {
                                    newCampus['roles'] = roles;
                                } else {
                                    // error
                                    console.log("error");
                                }
                            });
                            console.log(response);
                            newCampus['num_buildings'] = 0;
                            newCampus['num_lots'] = 0;
                            newCampus['num_gates'] = 0;
                            newCampus['bounds'] = mapService.convertToGMBounds(newCampus.perimeter);
                            newCampus['paths'] = mapService.convertToGMPaths(newCampus.perimeter);
                            newCampus['marker'] = new google.maps.Marker({
                                position: newCampus.bounds.getCenter(),
                                map: map,
                                title: newCampus.name
                            });
                        } else {
                            // error
                            console.log("error");
                        }
                    });
                } else if (self.modalMode === self.modalModeEnum.EDIT) {
                    var oldCampus = self.campuses[self.campusToUpdate];
                    campusService.updateCampus(self.campusToUpdate, newCampus, function (response) {
                        if (response) {
                            roleService.updateRoles(self.campusToUpdate, self.roles, function (roles) {
                                if (roles) {
                                    newCampus['roles'] = roles;
                                } else {
                                    // error
                                    console.log("error");
                                    newCampus['roles'] = oldCampus.roles;
                                }
                            });
                            console.log(response);
                            newCampus['num_buildings'] = oldCampus.num_buildings;
                            newCampus['num_lots'] = oldCampus.num_lots;
                            newCampus['num_gates'] = oldCampus.num_gates;
                            newCampus['bounds'] = mapService.convertToGMBounds(newCampus.perimeter);
                            newCampus['paths'] = mapService.convertToGMPaths(newCampus.perimeter);
                            
                            oldCampus.marker.setMap(null);
                            newCampus['marker'] = new google.maps.Marker({
                                position: newCampus.bounds.getCenter(),
                                map: map,
                                title: newCampus.name
                            });
                        } else {
                            // error
                            console.log("error");
                            getCampuses();                            
                        }
                    });
                }

                $('#modal-campus').modal('toggle');
            }

            self.deleteCampus = function (campusId) {
                var campus = self.campuses[campusId];
                campus.marker.setMap(null);
                campusService.deleteCampus(campusId, function (response) {
                    if (!response) {
                        // error
                        console.log("error");

                        // add marker back since we deleted it at the start of this function
                        campus['marker'] = new google.maps.Marker({
                            position: campus.bounds.getCenter(),
                            map: map,
                            title: campus.name
                        });
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
                center: USA_CENTER,
                zoom: DEFAULT_ZOOM
            });

            var modalMap = new google.maps.Map(document.getElementById('modal-map'), {
                center: USA_CENTER,
                zoom: DEFAULT_ZOOM
            });       
            var drawingManager = new google.maps.drawing.DrawingManager({
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.LEFT_BOTTOM,
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

            google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
                overlay = event.overlay;
                curType = event.type;
                updateBounds();
                updateListeners(true);
                drawingManager.setDrawingMode(null);
                drawingManager.setOptions({
                    drawingControl: false
                });
            });

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


            // Create the search box and link it to the UI element.
            var input = document.getElementById('pac-input');
            var searchBox = new google.maps.places.SearchBox(input);
            modalMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            // Bias the SearchBox results towards current map's viewport.
            modalMap.addListener('bounds_changed', function() {
                searchBox.setBounds(modalMap.getBounds());
            });

            // Listen for the event fired when the user selects a prediction and retrieve
            // more details for that place.
            searchBox.addListener('places_changed', function() {
                var places = searchBox.getPlaces();

                if (places.length == 0) {
                    return;
                }

                // For each place, get the icon, name and location.
                var bounds = new google.maps.LatLngBounds();
                places.forEach(function(place) {
                    if (!place.geometry) {
                        console.log("Returned place contains no geometry");
                        return;
                    }

                    var icon = {
                        url: place.icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(25, 25)
                    };

                    if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });
                modalMap.fitBounds(bounds);
            });

            $("#modal-campus").on("shown.bs.modal", function () {
                google.maps.event.trigger(modalMap, 'resize');
                drawingManager.setDrawingMode(null);
                if (self.modalMode === self.modalModeEnum.ADD) {
                    modalMap.setCenter(USA_CENTER);
                    modalMap.setZoom(DEFAULT_ZOOM);
                    drawingManager.setOptions({
                        drawingControl: true
                    });
                } else if (self.modalMode === self.modalModeEnum.EDIT) {
                    var campus = self.campuses[self.campusToUpdate];
                    $("#name").val(campus.name);
                    angular.copy(campus.roles, self.roles);
                    modalMap.fitBounds(campus.bounds);
                    if (campus.perimeter.length > 2) {
                        curType = 'polygon';
                        overlay = new google.maps.Polygon({
                            paths: campus.paths,
                            draggable: true,
                            editable: true
                        });
                    } else {
                        curType = 'rectangle';
                        overlay = new google.maps.Rectangle({
                            bounds: campus.bounds,
                            draggable: true,
                            editable: true
                        });
                    }
                    overlay.setMap(modalMap); 
                    updateListeners(true); 
                    drawingManager.setOptions({
                        drawingControl: false
                    });  
                    $scope.$apply();            
                }
            });

            $("#modal-campus").on("hidden.bs.modal", function () {
                $("#name").val("");
                $("#pac-input").val("");
                self.roles = [];
                bounds.clear();
                if (overlay) {
                    updateListeners(false);
                    overlay.setMap(null);
                    overlay = null;
                }
            });

            getCampuses();

        }]);
})();