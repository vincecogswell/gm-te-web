(function () {
	'use strict';

	angular
		.module('app').factory('mapService', mapService);

	function mapService() {

        function convertToGMPoint(point) {
            return new google.maps.LatLng(point['lat'], point['lng']);
        }

        function convertToGMPolygon(perimeter) {
            var bounds = new google.maps.LatLngBounds();
            for (var key in perimeter) {
                if (perimeter.hasOwnProperty(key)) {
                    let point = perimeter[key];
                    bounds.extend(new google.maps.LatLng(point['lat'], point['lng']));
                }
            }
            return bounds;
        }

		return {
            convertToGMPoint: convertToGMPoint,
            convertToGMPolygon: convertToGMPolygon
		}
	}
})();