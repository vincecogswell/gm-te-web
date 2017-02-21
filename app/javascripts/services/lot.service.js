(function () {
	'use strict';

	angular
		.module('app').factory('lotService', lotService);

	function lotService() {

		function getLotsOnCampus(campusId) {
			// API call
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

/*
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
		}*/

		var lots = {

		};

		/*var lots = {
			1: [
				{
					id: 1,
					name: "Lot A",
					status: "Active",
					access: "Everyone",
					hours: null,
					location: null,
					deleted: false
				}
			],
			2: [
				{
					id: 2,
					name: "Lot B",
					status: "Active",
					access: "Everyone",
					hours: null,
					location: null,
					deleted: false
				}
			]
		};*/

/*
		var lots = [
			{
				id: 1,
				name: "Lot A",
				status: "Active",
                access: "Everyone",
                location: null,
				deleted: false
			},
			{
				id: 2,
				name: "Lot B",
				status: "Active",
                access: "Everyone",
                location: null,
				deleted: false
			}
        ];*/

		return {
			getLotsOnCampus: getLotsOnCampus,
			getLot: getLot
		}
	}
})();