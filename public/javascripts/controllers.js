angular.module('cs411', ['ngRoute', 'ngCookies'])
    .controller('cs411ctrl', function ($scope, $http, $cookies) {
        $scope.initApp = function () {
            $scope.authorized = false
            let authCookie = $cookies.get('authStatus')
            $scope.authorized = !!authCookie
        }
        $scope.logout = function () {
            $http.get('/auth/logout')
                .then(function (response) {
                    $scope.authorized = false
                })
        }
        $scope.doTwitterAuth = function () {
            let openUrl = '/auth/twitter/'
            //Total hack, this:
            window.location.replace(openUrl)
            $scope.authorized = true

        }
        $scope.getRecipes = function () {
            $http.get('api/getRecipes')
                .then(function (response) {
                    $scope.recipes = response.data

                })
        }
        $scope.findStores = function () {
            let config = {
                method: 'post',
                url: 'http://localhost:3000/api/findStores/',
                data: {
                    SelectedCity: $scope.city,
                    SelectedState: $scope.state
                }
            }
            $http(config)
                .then(function (response) {
                    $scope.stores = response.data

                })
        }
        $scope.findIngredient = function () {
            let config = {
                method: 'post',
                url: 'http://localhost:3000/api/findIngredient/',
                data: {
                    StoreId: $scope.storeID,
                    ItemName: $scope.ingredient
                }
            }
            $http(config)
                .then(function (response) {
                    $scope.products = response.data

                })
        }
    })
    .config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when('/:status', {
                    templateUrl: '',
                    controller: 'authController'
                })
                .when(':status', {
                    templateUrl: '',
                    controller: 'authController'
                })
                .otherwise({
                    redirectTo: '/'
                })
        }])
    .controller('authController', function ($scope) {
        let authStatus = $location.search();
        console.log(authStatus)
        console.log('In authController')
        $scope.authorized = !!authStatus
    })
    //This controller handles toggling the display of details in the user list
    .controller('listController', function ($scope) {
        $scope.display = false
        $scope.showInfo = function () {
            $scope.display = !$scope.display
        }
    })