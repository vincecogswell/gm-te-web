(function () {
	'use strict';

	angular
		.module('app').factory('gateService', gateService);

	function gateService() {

		function getGatesOnCampus(campusId) {
			// API call
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

/*
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
		}*/

		var gates = {

		};

		/*var gates = {
			1: [
				{
					id: 1,
					name: "Gate A",
					status: "Active",
					access: "Everyone",
					hours: null,
					instructions: null,
					location: null,
					deleted: false
				}
			],
			2: [
				{
					id: 2,
					name: "Gate B",
					status: "Active",
					access: "Everyone",
					hours: null,
					instructions: null,
					location: null,
					deleted: false
				}
			]
		};*/

/*
		var gates = [
			{
				id: 1,
				name: "Gate A",
				status: "Active",
				access: "Everyone",
                hours: null,
                instructions: null,
                location: null,
				deleted: false
			},
			{
				id: 2,
				name: "Gate B",
				status: "Active",
				access: "Everyone",
                hours: null,
                instructions: null,
                location: null,
				deleted: false
			}
        ];*/

		return {
			getGatesOnCampus: getGatesOnCampus,
			getGate: getGate
		}
	}
})();