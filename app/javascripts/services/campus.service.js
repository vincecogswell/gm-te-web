(function () {
	'use strict';

	angular
		.module('app').factory('campusService', campusService);

	function campusService() {

		function getCampuses() {
			// API call
			// if (!campuses) then get campuses
            return campuses;
		}

		function getCampus(campusId) {
			for (var i = 0; i < campuses.length; i++) {
				let campus = campuses[i];
				if (campus.id === campusId) {
					return campus;
				}
			}
			return null;
		}

		var campuses = [
			{
				id: 1,
				name: "GM Technical Center",
				status: "Active",
				num_buildings: 38,
				num_lots: 30,
				num_gates: 5,
				location: null
			},
			{
				id: 2,
				name: "Michigan State University",
				status: "Active",
				num_buildings: 120,
				num_lots: 80,
				num_gates: 0,
				location: null
			}
        ];

		return {
			getCampuses: getCampuses,
			getCampus: getCampus
		}
	}
})();