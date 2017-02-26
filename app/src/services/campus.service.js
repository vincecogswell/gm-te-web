(function () {
	'use strict';

	angular
		.module('app').factory('campusService', campusService);

	campusService.$inject = ['$http', '$q'];

	function campusService($http, $q) {

		var _campusesPromise;

		function getCampuses() {
			if (!_campusesPromise) {
				var deferred = $q.defer();
				$http.get("/campus/1/gates")
				.then( function (response) {
					console.log(response);
					deferred.resolve(response);
				});

				_campusesPromise = deferred.promise;
			}

            return campuses;
			//return _campusesPromise;
		}

        var _usersPromise;

        function getUsers() {
            if(!_usersPromise) {          
                var deferred = $q.defer();
                var username = '';
                if (simulatedUser) {
                    username = simulatedUser.username;
                }
                Users.query({ username: username }, function (allUsers) {
                    var windowsUsername = allUsers[1];
                    users = Object.keys(allUsers[0]).map(function (key) { return allUsers[0][key] } ); // converting object to array

                    users.forEach(function(user, index) {
                        if (!simulatedUser && user.username === windowsUsername) {
                            curUser = user;
                        }
                        user.projects = user.projects.map(projectsService.normalizeProjectFromDB);
                    });
                                               
                    deferred.resolve(users);
                });
                
                _usersPromise = deferred.promise;
            }

            return _usersPromise;
        }

		function getCampus(campusId) {
			for (var _campusId in campuses) {
				if (campuses.hasOwnProperty(_campusId)) {
					if (Number(_campusId) === campusId) {
						return campuses[_campusId];
					}
				}
			}
			return null;
		}

		var campuses = { };

		return {
			getCampuses: getCampuses,
			getCampus: getCampus
		}
	}
})();
