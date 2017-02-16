(function () {
	'use strict';

	angular
		.module('app').factory('campusService', campusService);

	function campusService() {

		function getCampuses() {
            return campuses; 
		}

		function getCampusById(id) {
			for (var i = 0; i < campuses.length; i++) {
				let campus = campuses[i];
				if (campus.id === id) {
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
				num_lots: 30
			},
			{
				id: 2,
				name: "Michigan State University",
				status: "Active",
				num_buildings: 120,
				num_lots: 80
			}
        ];

		return {
			getCampuses: getCampuses,
			getCampusById: getCampusById
		}
	}
})();