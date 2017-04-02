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

            self.invalid = null;

            self.logout = function () {
                loginService.logout();
            }

            self.login = function () {
                self.invalid = null;

                if (self.user.username === '') {
                    // error - username can't be empty
                    self.invalid = 'Please enter a username';
                    return;
                }

                if (self.user.password === '') {
                    // error - password can't be empty
                    self.invalid = 'Please enter a password';
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
                        self.invalid = 'Invalid username or password';
                        console.log("error");
                    }
                });

            }

        }]);
})();