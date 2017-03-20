(function () {
	'use strict';

	angular
		.module('app').factory('roleService', roleService);

	roleService.$inject = ['$http'];

	function roleService($http) {

        function getRoles(campusId, next) {
            $http.get('/campuses/' + campusId.toString() + '/roles')
            .then( function (response) {
                console.log(response);
                if (response && response.data && response.data.status === 200) {
                    var roles = response.data.roles;
                    next(roles);
                } else {
                    // error
                    next(null);
                }
            });
        }

        function saveRoles(campusId, roles, next) {
            var cnt = 0;
            for (var i = 0; i < roles.length; i++) {
                let role = roles[i];
                $http.post('/campuses/' + campusId.toString() + '/roles', role)
                .then( function (response) {
                    console.log(response);
                    if (response && response.data && response.data.status === 200) {
                        var roleId = response.data.roleId;
                        role['id'] = roleId;
                        cnt++;
                        if (cnt >= roles.length) {
                            next(roles);
                        }
                    } else {
                        // error
                        next(null);
                    }
                });
            }
        }

        function updateRoles(campusId, roles, next) {
            var cnt = 0;
            for (var i = 0; i < roles.length; i++) {
                let role = roles[i];
                $http.put('/campuses/' + campusId.toString() + '/roles/' + role.id.toString(), role)
                .then( function (response) {
                    console.log(response);
                    if (response && response.data && response.data.status === 200) {
                        cnt++;
                        if (cnt >= roles.length) {
                            next(roles);
                        }
                    } else {
                        // error
                        next(null);
                    }
                });
            }
        }

        function deleteRoles(campusId, roles, next) {
            var cnt = 0;
            for (var i = 0; i < roles.length; i++) {
                let role = roles[i];
                $http.delete('/campuses/' + campusId.toString() + '/roles/' + role.id.toString())
                .then( function (response) {
                    console.log(response);
                    if (response && response.data && response.data.status === 200) {
                        cnt++;
                        if (cnt >= roles.length) {
                            next(roles);
                        }
                    } else {
                        // error
                        next(null);
                    }
                });
            }
        }

		return {
			getRoles: getRoles,
			saveRoles: saveRoles,
			updateRoles: updateRoles,
            deleteRoles: deleteRoles
		}
	}
})();