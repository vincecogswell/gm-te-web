(function () {
	'use strict';

	angular
		.module('app').factory('campusService', campusService);

	function campusService() {

		function getCampuses() {
			// TO DO: API call
            return campuses;
		}

		function getCampus(campusId) {
			for (var _campusId in campuses) {
				if (campuses.hasOwnProperty(_campusId)) {
					if (Number(_campusId) === campusId) {
						return campuses[_campusId];
					}
				}
			}
			return null;
		}

		var campuses = { };

		return {
			getCampuses: getCampuses,
			getCampus: getCampus
		}
	}
})();