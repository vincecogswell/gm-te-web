(function () {
	'use strict';

	angular
		.module('app').factory('buildingService', buildingService);

	function buildingService() {

		function getBuildingsOnCampus(campusId) {
			// TO DO: API call
			for (var _campusId in buildings) {
				if (buildings.hasOwnProperty(_campusId)) {
					if (Number(_campusId) === campusId) {
						return buildings[_campusId];
					}
				}
			}
			return [];
		}

		function getBuilding(campusId, buildingId) {
			for (var _campusId in buildings) {
				if (buildings.hasOwnProperty(_campusId)) {
					if (Number(_campusId) === campusId) {
						let buildingsOnCampus = buildings[_campusId];
						for (var i = 0; i < buildingsOnCampus.length; i++) {
							let building = buildingsOnCampus[i];
							if (building.id === buildingId) {
								return building;
							}
						}
					}
				}
			}
			return null;
		}

		var buildings = { };

		return {
			getBuildingsOnCampus: getBuildingsOnCampus,
			getBuilding: getBuilding
		}
	}
})();