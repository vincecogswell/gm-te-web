(function () {
    'use strict';

    angular
        .module('app.login', ['ngRoute'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/login', {
                templateUrl: 'partials/components/login.component.html',
                bindToController: true,
                controllerAs: 'vm',
                controller: 'LoginCtrl',
                resolve: {
                    loginService: function(loginService) {
                        return loginService;
                    }
                }
            });
        }])
        .controller('LoginCtrl', ['loginService', '$location', function (loginService, $location) {
            var self = this;

            if (loginService.userIsLoggedIn()) {
                $location.path('/campuses');
            }

            self.user = {
                username: '',
                password: ''
            };

            self.logout = function () {
                loginService.logout();
            }

            self.login = function () {
                if (self.user.username === '') {
                    // error - name can't be empty
                    return;
                }

                if (self.user.password === '') {
                    // error - password can't be empty
                    return;
                }

                var user = {
                    username: self.user.username,
                    password: self.user.password
                };

                loginService.login(user, function (response) {
                    if (response) {
                        $location.path('/campuses');
                    } else {
                        // error
                        console.log("error");
                    }
                });

            }

        }]);
})();