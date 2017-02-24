(function () {
	'use strict';

	angular
		.module('app').factory('gateService', gateService);

	function gateService() {

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
		}


		var gates = { };

		return {
			getGatesOnCampus: getGatesOnCampus,
			getGate: getGate
		}
	}
})();