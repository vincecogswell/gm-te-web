(function () {
	'use strict';

	angular
		.module('app').factory('loginService', loginService);

	loginService.$inject = ['$http'];

	function loginService($http) {

		function login(credentials, next) {
			$http.post('/authenticate', credentials)
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					var userId = response.data.userId;
					curUser = userId;
					next(curUser);
				} else {
					// error
					next(null);
				}
			});
		}

		var curUser = null;    // a user id

        // Note: Remember to check for curUser in campuses and campus page
        // if curUser is null then redirect to login page

		return {
			login: login
		}
	}
})();