(function () {
	'use strict';

	angular
		.module('app').factory('gateService', gateService);

	gateService.$inject = ['$http'];

	function gateService($http) {

		function getGates(campusId, next) {
			if (gates) {
				next(gates);
			} else {
				$http.get('/campuses/' + campusId.toString() + '/gates')
				.then( function (response) {
					console.log(response);
					if (response && response.data && response.data.status === 200) {
						gates = response.data.gates;
						next(gates);
					} else {
						// error
						next(null);
					}
				});
			}
		}

		function saveGate(campusId, gate, next) {
			$http.post('/campuses/' + campusId.toString() + '/gates', gate)
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					var gateId = response.data.gateId;
					gates[gateId] = gate;
					next(gateId);
				} else {
					// error
					next(null);
				}
			});
		}

		function updateGate(campusId, gateId, gate, next) {
			$http.put('/campuses/' + campusId.toString() + '/gates/' + gateId.toString(), gate)
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					var gateId = response.data.gateId;
					gates[gateId] = gate;
					next(gateId);
				} else {
					// error
					next(null);
				}
			});
		}

		function deleteGate(campusId, gateId, next) {
			$http.delete('/campuses/' + campusId.toString() + '/gates/' + gateId.toString())
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					var gateId = response.data.gateId;
					delete gates[gateId];
					next(gateId);
				} else {
					// error
					next(null);
				}
			});
		}

		/*
		function getGatesOnCampus(campusId) {
			// TO DO: API call
			for (var _campusId in gates) {
				if (gates.hasOwnProperty(_campusId)) {
					if (Number(_campusId) === campusId) {
						return gates[_campusId];
					}
				}
			}
			return [];
		}

		function getGate(campusId, gateId) {
			for (var _campusId in gates) {
				if (gates.hasOwnProperty(_campusId)) {
					if (Number(_campusId) === campusId) {
						let gatesOnCampus = gates[_campusId];
						for (var i = 0; i < gatesOnCampus.length; i++) {
							let gate = gatesOnCampus[i];
							if (gate.id === gateId) {
								return gate;
							}
						}
					}
				}
			}
			return null;
		}*/

		var gates = null;

		return {
			getGates: getGates,
			saveGate: saveGate,
			updateGate: updateGate,
			deleteGate: deleteGate
		}
	}
})();