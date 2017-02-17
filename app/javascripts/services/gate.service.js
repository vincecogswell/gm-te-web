(function () {
	'use strict';

	angular
		.module('app').factory('gateService', gateService);

	function gateService() {

		function getGatesOnCampus(campusId) {
			// API call
			return gates;
		}

		function getGate(gateId) {
			for (var i = 0; i < gates.length; i++) {
				let gate = gates[i];
				if (gate.id === gateId) {
					return gate;
				}
			}
			return null;
		}

		var gates = [
			{
				id: 1,
				name: "College of Engineering",
				status: "Active",
                hours: null,
                instructions: null,
                location: null
			},
			{
				id: 2,
				name: "International Center",
				status: "Active",
                hours: null,
                instructions: null,
                location: null
			}
        ];

		return {
			getGatesOnCampus: getGatesOnCampus,
			getGate: getGate
		}
	}
})();