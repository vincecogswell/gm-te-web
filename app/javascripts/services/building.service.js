(function () {
	'use strict';

	angular
		.module('app').factory('buildingService', buildingService);

	function buildingService() {

		function getBuildingsOnCampus(campusId) {
			// API call
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
			/*for (var i = 0; i < buildings.length; i++) {
				let building = buildings[i];
				if (building.id === buildingId) {
					return building;
				}
			}*/
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

		var buildings = {

		};

		/*var buildings = {
			1: [
				{
					id: 1,
					name: "College of Engineering",
					status: "Active",
					location: null,
					deleted: false
				}
			],
			2: [
				{
					id: 2,
					name: "International Center",
					status: "Active",
					location: null,
					deleted: false
				}
			]			
		};*/

/*
		var buildings = [
			{
				id: 1,
				name: "College of Engineering",
				status: "Active",
				location: null,
				deleted: false
			},
			{
				id: 2,
				name: "International Center",
				status: "Active",
				location: null,
				deleted: false
			}
        ];*/

		return {
			getBuildingsOnCampus: getBuildingsOnCampus,
			getBuilding: getBuilding
		}
	}
})();