(function () {
	'use strict';

	angular
		.module('app').factory('lotService', lotService);

	function lotService() {

		function getLotsOnCampus(campusId) {
			// TO DO: API call
			for (var _campusId in lots) {
				if (lots.hasOwnProperty(_campusId)) {
					if (Number(_campusId) === campusId) {
						return lots[_campusId];
					}
				}
			}
			return [];
		}

		function getLot(campusId, lotId) {
			for (var _campusId in lots) {
				if (lots.hasOwnProperty(_campusId)) {
					if (Number(_campusId) === campusId) {
						let lotsOnCampus = lots[_campusId];
						for (var i = 0; i < lotsOnCampus.length; i++) {
							let lot = lotsOnCampus[i];
							if (lot.id === lotId) {
								return lot;
							}
						}
					}
				}
			}
			return null;
		}

		var lots = { };

		return {
			getLotsOnCampus: getLotsOnCampus,
			getLot: getLot
		}
	}
})();