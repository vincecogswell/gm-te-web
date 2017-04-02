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

    navbarController.$inject = ['loginService', '$location'];

    function navbarController(loginService, $location) {
        var self = this;

        self.logout = function () {
            loginService.logout();
            $location.path('/login');
        }
    }

})();