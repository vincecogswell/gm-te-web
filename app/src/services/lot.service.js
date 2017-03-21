(function () {
	'use strict';

	angular
		.module('app').factory('lotService', lotService);

	lotService.$inject = ['$http'];
	
	function lotService($http) {

		function getLots(campusId, next) {
			if (lots) {
				next(lots);
			} else {
				$http.get('/campuses/' + campusId.toString() + '/lots')
				.then( function (response) {
					console.log(response);
					if (response && response.data && response.data.status === 200) {
						lots = response.data.lots;
						next(lots);
					} else {
						// error
						next(null);
					}
				});
			}
		}

		function saveLot(campusId, lot, next) {
			console.log(lot);
			$http.post('/campuses/' + campusId.toString() + '/lots', lot)
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					var lotId = response.data.lotId;
					lots[lotId] = lot;
					next(lotId);
				} else {
					// error
					next(null);
				}
			});
		}

		function updateLot(campusId, lotId, lot, next) {
			$http.put('/campuses/' + campusId.toString() + '/lots/' + lotId.toString(), lot)
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					var lotId = response.data.lotId;
					lots[lotId] = lot;
					next(lotId);
				} else {
					// error
					next(null);
				}
			});
		}

		function deleteLot(campusId, lotId, next) {
			$http.delete('/campuses/' + campusId.toString() + '/lots/' + lotId.toString())
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					var lotId = response.data.lotId;
					delete lots[lotId];
					next(lotId);
				} else {
					// error
					next(null);
				}
			});
		}

		/*

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
		}*/

		var lots = { };

		return {
			getLots: getLots,
			saveLot: saveLot,
			updateLot: updateLot,
			deleteLot: deleteLot
		}
	}
})();