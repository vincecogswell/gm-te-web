(function () {
	'use strict';

	angular
		.module('app').factory('lotService', lotService);

	function lotService() {

		function getLotsOnCampus(campusId) {
			// API call
			return lots;
		}

		function getLot(lotId) {
			for (var i = 0; i < lots.length; i++) {
				let lot = lots[i];
				if (lot.id === lotId) {
					return lot;
				}
			}
			return null;
		}

		var lots = [
			{
				id: 1,
				name: "College of Engineering",
				status: "Active",
                access: "Everyone",
                location: null
			},
			{
				id: 2,
				name: "International Center",
				status: "Active",
                access: "Everyone",
                location: null
			}
        ];

		return {
			getLotsOnCampus: getLotsOnCampus,
			getLot: getLot
		}
	}
})();