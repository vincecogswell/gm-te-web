(function () {
    "use strict";

    angular
        .module('app').directive('navbar', function () {
            return {                                        
                bindToController: true,
                controllerAs: 'vm',
                controller: navbarController,                
                templateUrl: 'partials/components/navbar.component.html'
            }
        });

    navbarController.$inject = ['loginService', '$cookies', '$location'];

    function navbarController(loginService, $cookies, $location) {
        var self = this;

        self.logout = function () {
            loginService.logout();
            $cookies.put('loggedIn', 'no');
            $location.path('/login');
        }
    }

})();