(function () {
	'use strict';

	angular
		.module('app').factory('mapService', mapService);

	function mapService() {

        function convertToGMCoord(coord) {
            // could make the 0's and 1's into an enum
            coord[0] = Number(coord[0]);
            coord[1] = Number(coord[1]);
            return new google.maps.LatLng(coord[0], coord[1]);
        }

        function convertToGMPolygon(perimeter) {
            var bounds = new google.maps.LatLngBounds();
            /*for (var key in perimeter) {
                if (perimeter.hasOwnProperty(key)) {
                    let point = perimeter[key];
                    bounds.extend(new google.maps.LatLng(point['lat'], point['lng']));
                }
            }*/
            for (var i = 0; i < perimeter.length; i++) {
                let coord = perimeter[i];
                coord[0] = Number(coord[0]);
                coord[1] = Number(coord[1]);
                bounds.extend(new google.maps.LatLng(coord[0], coord[1]));            
            }
            return bounds;
        }

		return {
            convertToGMCoord: convertToGMCoord,
            convertToGMPolygon: convertToGMPolygon
		}
	}
})();