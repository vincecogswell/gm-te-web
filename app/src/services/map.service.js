(function () {
	'use strict';

	angular
		.module('app').factory('mapService', mapService);

	function mapService() {

        var COORD = {
            LAT: 0,
            LNG: 1
        };

        function convertToGMCoord(coord) {
            // could make the 0's and 1's into an enum
            coord[COORD.LAT] = Number(coord[COORD.LAT]);
            coord[COORD.LNG] = Number(coord[COORD.LNG]);
            return new google.maps.LatLng(coord[COORD.LAT], coord[COORD.LNG]);
        }

        function convertToGMBounds(perimeter) {
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < perimeter.length; i++) {
                let coord = perimeter[i];
                coord[COORD.LAT] = Number(coord[COORD.LAT]);
                coord[COORD.LNG] = Number(coord[COORD.LNG]);
                bounds.extend(new google.maps.LatLng(coord[COORD.LAT], coord[COORD.LNG]));            
            }
            return bounds;
        }

        function convertToGMPaths(perimeter) {
            var paths = [];
            for (var i = 0; i < perimeter.length; i++) {
                let coord = perimeter[i];
                coord[COORD.LAT] = Number(coord[COORD.LAT]);
                coord[COORD.LNG] = Number(coord[COORD.LNG]);
                paths.push({ 'lat': coord[COORD.LAT], 'lng': coord[COORD.LNG] });          
            }
            return paths;
        }

		return {
            convertToGMCoord: convertToGMCoord,
            convertToGMBounds: convertToGMBounds,
            convertToGMPaths: convertToGMPaths
		}
	}
})();