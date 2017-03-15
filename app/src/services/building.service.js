(function () {
	'use strict';

	angular
		.module('app').factory('buildingService', buildingService);

	buildingService.$inject = ['$http'];

	function buildingService($http) {

		function getBuildings(campusId, next) {
			if (buildings) {
				next(buildings);
			} else {
				console.log("here");
				console.log(campusId);
				$http.get('/campuses/' + campusId.toString() + '/buildings')
				.then( function (response) {
					console.log(response);
					if (response && response.data && response.data.status === 200) {
						buildings = response.data.buildings;
						next(buildings);
					} else {
						// error
						next(null);
					}
				});
			}
		}

		function saveBuilding(campusId, building, next) {
			$http.post('/campuses/' + campusId.toString() + '/buildings', building)
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					var buildingId = response.data.buildingId;
					buildings[buildingId] = building;
					next(buildingId);
				} else {
					// error
					next(null);
				}
			});
		}

		function updateBuilding(campusId, buildingId, building, next) {
			$http.put('/campuses/' + campusId.toString() + '/buildings/' + buildingId.toString(), building)
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					var buildingId = response.data.buildingId;
					buildings[buildingId] = building;
					next(buildingId);
				} else {
					// error
					next(null);
				}
			});
		}

		function deleteBuilding(campusId, buildingId, next) {
			$http.delete('/campuses/' + campusId.toString() + '/buildings/' + buildingId.toString())
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					var buildingId = response.data.buildingId;
					delete buildings[buildingId];
					next(buildingId);
				} else {
					// error
					next(null);
				}
			});
		}


		/*
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
		}*/

		var buildings = { };

		return {
			getBuildings: getBuildings,
			saveBuilding: saveBuilding,
			updateBuilding: updateBuilding,
			deleteBuilding: deleteBuilding
		}
	}
})();