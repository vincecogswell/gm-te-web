(function () {
    'use strict';

    angular
        .module('app')
        .controller('AddCampusController', ['$uibModalInstance', 'NgMap', '$scope', AddCampusController]);

    function AddCampusController($uibModalInstance, NgMap, $scope) {
        var self = this;
        //$scope.render = true;
        /*console.log(NgMap.getMap());
        NgMap.getMap().then(function(map) {
            console.log("hereee");
            console.log(map.getCenter());
            console.log('markers', map.markers);
            console.log('shapes', map.shapes);
        });*/

        self.campus = {
            name: "",
            status: "Active",
            num_buildings: 0,
            num_lots: 0,
            num_gates: 0,
            location: null,
            deleted: false
        }

        var map;
        self.createMap = function () {
            var map = new google.maps.Map(document.getElementById('modal-map'), {
                center: {lat: 38.0902, lng: -95.7129},
                zoom: 4
            });         
            /*var drawingManager = new google.maps.drawing.DrawingManager({
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
            drawingManager.setMap(map);*/
        }

        google.maps.event.addListenerOnce(map, 'idle', function() {
            google.maps.event.trigger(map, 'resize');
        });        

/*
        $("#modal-map").on("shown.bs.modal", function () {
            console.log("HEREEE");
            
        });*/

        self.ok = function () {
            $uibModalInstance.close(self.campus);
        }

        self.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }
    }

})();