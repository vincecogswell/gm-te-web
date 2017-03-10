(function () {
	'use strict';

	angular
		.module('app').factory('campusService', campusService);

	campusService.$inject = ['$http'];

	function campusService($http) {

		function getCampuses(next) {
			if (campuses) {
				next(campuses);
			} else {
				$http.get('/campus')
				.then( function (response) {
					console.log(response);
					if (response && response.data && response.data.status === 200) {
						campuses = response.data.campuses;
						next(campuses);
					} else {
						// error
						next(null);
					}
				});
			}
		}

		function saveCampus(campus, next) {
			$http.post('/campus', campus)
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					var campusId = response.data.campusId;
					campuses[campusId] = campus;
					next(campusId);
				} else {
					// error
					next(null);
				}
			});
		}

		function updateCampus(campusId, campus, next) {
			$http.put('/campus/' + campusId.toString(), campus)
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					var campusId = response.data.campusId;
					campuses[campusId] = campus;
					next(campusId);
				} else {
					// error
					next(null);
				}
			});
		}

		function deleteCampus(campusId, next) {
			$http.delete('/campus/' + campusId.toString())
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					var campusId = response.data.campusId;
					delete campuses[campusId];
					next(campusId);
				} else {
					// error
					next(null);
				}
			});
		}

		function getCampus(campusId) {
			/*for (var _campusId in campuses) {
				if (campuses.hasOwnProperty(_campusId)) {
					if (Number(_campusId) === campusId) {
						return campuses[_campusId];
					}
				}
			}
			return null;*/
			if (campuses.hasOwnProperty(campusId)) {
				return campuses[campusId];
			}
			return null;
		}

		var campuses = null;

		return {
			getCampuses: getCampuses,
			saveCampus: saveCampus,
			updateCampus: updateCampus,
			deleteCampus: deleteCampus,
			getCampus: getCampus
		}
	}
})();
