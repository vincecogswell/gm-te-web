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
                    }
                }
            });
        }])
        .controller('CampusesCtrl', ['campusService', '$uibModal', function (campusService, $uibModal) {
            var self = this;
            campusService.getCampuses()
            .then( function (response) {
                self.campuses = response;
                // populate map
            });
            //self.campuses = { };

            self.saveCampus = function () {
                var newCampus = {
                    name: $("#name").val(),
                    active: true,
                    perimeter: perimeter.getArray()
                };
                campusService.saveCampus(newCampus)
                .then( function (response) {
                    if (response) {
                        console.log(response);
                        newCampus['num_buildings'] = 0;
                        newCampus['num_lots'] = 0;
                        newCampus['num_gates'] = 0;
                        var marker = new google.maps.Marker({
                            position: modalMap.getCenter(),
                            map: map,
                            title: newCampus.name
                        });
                    } else {
                        // error
                        console.log("error");
                    }
                });

                $('#modal-add-campus').modal('toggle');
            }

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
            var perimeter = new google.maps.MVCArray();
            google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
                if (event.type == 'rectangle') {
                    perimeter.push(event.overlay.getBounds().getNorthEast());
                    perimeter.push(event.overlay.getBounds().getSouthWest());
                } else if (event.type == 'polygon') {
                    var path = event.overlay.getPath();
                    for (var i = 0; i < path.getLength(); i++) {
                        perimeter.push(path.getAt(i));
                    }
                }
                overlay = event.overlay;
                drawingManager.setDrawingMode(null);
                drawingManager.setOptions({
                    drawingControl: false
                });
            });

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

            $("#modal-add-campus").on("shown.bs.modal", function () {
                var curCenter = modalMap.getCenter();
                google.maps.event.trigger(modalMap, 'resize');
                modalMap.setCenter(curCenter);
            });

            $("#modal-add-campus").on("hidden.bs.modal", function () {
                $("#name").val("");
                $("#pac-input").val("");
                if (overlay) {
                    overlay.setMap(null);
                }
                drawingManager.setOptions({
                    drawingControl: true
                });
                modalMap.setCenter({lat: 38.0902, lng: -95.7129});
                modalMap.setZoom(4);
            });

        }]);
})();