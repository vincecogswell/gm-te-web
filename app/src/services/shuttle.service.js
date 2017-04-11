(function () {
	'use strict';

	angular
		.module('app').factory('shuttleService', shuttleService);

	lotService.$inject = ['$http'];
	
	function shuttleService($http) {

		function getShuttles(campusId, next) {
			$http.get('/campuses/' + campusId.toString() + '/shuttles')
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					shuttles = response.data.shuttles;
					next(shuttles);
				} else {
					// error
					next(null);
				}
			});
		}

		function saveShuttle(campusId, shuttle, next) {
			$http.post('/campuses/' + campusId.toString() + '/shuttle', shuttle)
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					var shuttleId = response.data.shuttleId;
					shuttles[shuttleId] = shuttle;
					next(shuttleId);
				} else {
					// error
					console.log(lot);
					next(null);
				}
			});
		}

		function updateShuttle(campusId, shuttleId, shuttle, next) {
			$http.put('/campuses/' + campusId.toString() + '/shuttles/' + shuttleId.toString(), shuttle)
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					var shuttleId = response.data.shuttleId;
					shuttles[shuttleId] = shuttle;
					next(shuttleId);
				} else {
					// error
					next(null);
				}
			});
		}

		function deleteShuttle(campusId, shuttleId, next) {
			$http.delete('/campuses/' + campusId.toString() + '/shuttles/' + shuttleId.toString())
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					var shuttleId = response.data.shuttleId;
					delete shuttles[shuttleId];
					next(shuttleId);
				} else {
					// error
					next(null);
				}
			});
		}

		var shuttles = null;

		return {
			getShuttles: getShuttles,
			saveShuttle: saveShuttle,
			updateShuttle: updateShuttle,
			deleteShuttle: deleteShuttle
		}
	}
})();