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
                    mapService: function(mapService) {
                        return mapService;
                    }
                }
            });
        }])
        .controller('CampusesCtrl', ['campusService', 'mapService', '$uibModal', function (campusService, mapService, $uibModal) {
            var self = this;

            self.campusToEdit = null;

            self.modalModeEnum = {
                ADD: 0,
                EDIT: 1
            };
            self.modalMode = null;

            var USA_CENTER = {lat: 38.0902, lng: -95.7129};
            var DEFAULT_ZOOM = 4;

            function getCampuses() {
                campusService.getCampuses(function (campuses) {
                    self.campuses = campuses;
                    // populate map
                    for (var key in self.campuses) {
                        if (self.campuses.hasOwnProperty(key)) {
                            let campus = self.campuses[key];
                            campus['bounds'] = mapService.convertToGMPolygon(campus.perimeter);
                            campus['marker'] = new google.maps.Marker({
                                position: campus.bounds.getCenter(),
                                map: map,
                                title: campus.name
                            });
                        }
                    }
                });
            }

            self.saveCampus = function () {
                var perimeter = [];
                for (var i = 0; i < bounds.getLength(); i++) {
                    let coord = bounds.getAt(i);
                    perimeter.push({ 'lat': coord.lat(), 'lng': coord.lng() });
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
                            console.log(response);
                            newCampus['num_buildings'] = 0;
                            newCampus['num_lots'] = 0;
                            newCampus['num_gates'] = 0;
                            newCampus['marker'] = new google.maps.Marker({
                                position: bounds.getCenter(),
                                map: map,
                                title: newCampus.name
                            });
                        } else {
                            // error
                            console.log("error");
                        }
                    });
                } else if (self.modalMode === self.modalModeEnum.EDIT) {
                    campusService.updateCampus(self.campusToEdit, newCampus, function (response) {
                        if (response) {
                            console.log(response);
                            newCampus['marker'].setMap(null);
                            newCampus['marker'] = new google.maps.Marker({
                                position: bounds.getCenter(),
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
                campusService.deleteCampus(campusId, function (response) {
                    if (response) {
                        self.campuses[campusId]['marker'].setMap(null);
                    } else {
                        // error
                        console.log("error");
                    }
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

            var overlay;
            var bounds = new google.maps.MVCArray();
            var curType = null;
            google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
                overlay = event.overlay;
                curType = event.type;
                updateBounds();
                if (event.type === 'rectangle') {
                    //bounds.push(event.overlay.getBounds().getNorthEast());
                    //bounds.push(event.overlay.getBounds().getSouthWest());
                    updateListenerOnRectangle(true);
                } else if (event.type === 'polygon') {
                    /*var path = event.overlay.getPath();
                    for (var i = 0; i < path.getLength(); i++) {
                        bounds.push(path.getAt(i));
                    }*/
                    updateListenersOnPolygon(true);
                }
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
                console.log(bounds.getAt(i).lat());
                console.log(bounds.getAt(i).lng());
            }

            function updateListenersOnPolygon(addListeners) {
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

            function updateListenerOnRectangle(addListener) {
                if (addListener) {
                    google.maps.event.addListener(overlay, 'bounds_changed', function () {
                        updateBounds();
                    });
                } else {
                    google.maps.event.clearInstanceListeners(overlay);
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
                //var curCenter = modalMap.getCenter();
                google.maps.event.trigger(modalMap, 'resize');
                drawingManager.setDrawingMode(null);
                if (self.modalMode === self.modalModeEnum.ADD) {
                    modalMap.setCenter(USA_CENTER);
                    modalMap.setZoom(DEFAULT_ZOOM);
                    drawingManager.setOptions({
                        drawingControl: true
                    });
                } else if (self.modalMode === self.modalModeEnum.EDIT) {
                    var campus = self.campuses[self.campusToEdit];
                    $("#name").val(campus.name);
                    modalMap.fitBounds(campus.bounds);
                    overlay = new google.maps.Polygon({
                        paths: campus.perimeter,
                        draggable: true,
                        editable: true
                    });
                    overlay.setMap(modalMap); 
                    curType = 'polygon';
                    updateListenersOnPolygon(true); 
                    drawingManager.setOptions({
                        drawingControl: false
                    });              
                }
            });

            $("#modal-campus").on("hidden.bs.modal", function () {
                $("#name").val("");
                $("#pac-input").val("");
                bounds.clear();
                if (overlay) {
                    if (curType === 'rectangle') {
                        updateListenerOnRectangle(false);
                    } else if (curType === 'polygon') {
                        updateListenersOnPolygon(false);
                    }
                    overlay.setMap(null);
                    overlay = null;
                }
            });


            getCampuses();

        }]);
})();