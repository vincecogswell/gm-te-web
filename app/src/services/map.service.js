(function () {
	'use strict';

	angular
		.module('app').factory('mapService', mapService);

	function mapService() {

        function convertToGMCoord(coord) {
            coord['lat'] = Number(coord['lat']);
            coord['lng'] = Number(coord['lng']);
            return new google.maps.LatLng(coord['lat'], coord['lng']);
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
                coord['lat'] = Number(coord['lat']);
                coord['lng'] = Number(coord['lng']);
                bounds.extend(new google.maps.LatLng(coord['lat'], coord['lng']));            
            }
            return bounds;
        }

		return {
            convertToGMPoint: convertToGMPoint,
            convertToGMPolygon: convertToGMPolygon
		}
	}
})();