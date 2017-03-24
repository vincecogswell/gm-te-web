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
				$http.get('/campuses')
				.then( function (response) {
					console.log(response);
					if (response && response.data && response.data.status === 200) {
						campuses = response.data.campuses;
						$http.get('/predictive-parking/1/1')
						.then( function (response) {
							console.log(response);
						});
						next(campuses);
					} else {
						// error
						next(null);
					}
				});
			}
		}

		function saveCampus(campus, next) {
			$http.post('/campuses', campus)
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
			$http.put('/campuses/' + campusId.toString(), campus)
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
			$http.delete('/campuses/' + campusId.toString())
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

		// dont need this function
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
