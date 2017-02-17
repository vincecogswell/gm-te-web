(function () {
	'use strict';

	angular
		.module('app').factory('buildingService', buildingService);

	function buildingService() {

		function getBuildingsOnCampus(campusId) {
			// API call
			return buildings;
		}

		function getBuilding(buildingId) {
			for (var i = 0; i < buildings.length; i++) {
				let building = buildings[i];
				if (building.id === buildingId) {
					return building;
				}
			}
			return null;
		}

		var buildings = [
			{
				id: 1,
				name: "College of Engineering",
				status: "Active",
				location: null
			},
			{
				id: 2,
				name: "International Center",
				status: "Active",
				location: null
			}
        ];

		return {
			getBuildingsOnCampus: getBuildingsOnCampus,
			getBuilding: getBuilding
		}
	}
})();