(function () {
	'use strict';

	angular
		.module('app').factory('loginService', loginService);

	loginService.$inject = ['$http', '$cookies'];

	function loginService($http, $cookies) {

		function login(credentials, next) {
			$http.post('/authenticate', credentials)
			.then( function (response) {
				console.log(response);
				if (response && response.data && response.data.status === 200) {
					$cookies.put('loggedIn', 'yes');
					var userId = response.data.userId;
					next(userId);
				} else {
					// error
					next(null);
				}
			});
		}

        function userIsLoggedIn() {
            var loggedIn = $cookies.get('loggedIn');
            if (loggedIn === 'yes') {
                return true;
            }
            return false;
        }

        function logout() {
            $cookies.put('loggedIn', 'no');
        }

		return {
			login: login,
            userIsLoggedIn: userIsLoggedIn,
            logout: logout
		}
	}
})();