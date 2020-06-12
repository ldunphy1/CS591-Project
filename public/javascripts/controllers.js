angular.module('cs411', ['ngRoute', 'ngCookies'])
    .controller('cs411ctrl', function ($scope, $http, $cookies) {

        //initialize app and check whether user has logged in
            $scope.initApp = function () {
                $scope.authorized = false
                let authCookie = $cookies.get('authStatus')
                $scope.authorized = true//!!authCookie
            }

        //log user out
            $scope.logout = function () {
                $http.get('/auth/logout')
                    .then(function (response) {
                        $scope.authorized = false
                    })
            }

        //authorize user with Twitter
            $scope.doTwitterAuth = function () {
                /* let openUrl = '/auth/twitter/'
                window.location.replace(openUrl) */

            }

        //gets 1st page of recipes based on user input
            $scope.getRecipes = function () {
                $scope.recipeMessage=null
                let config = {
                    method: 'post',
                    url: 'http://localhost:3000/api/getRecipes/',
                    data: {
                        page: $scope.page = 1,      //initializes page # to 1
                        q: $scope.item              //retrieves user input
                    }
                }
                $http(config)
                    .then(function (response) {
                        $scope.recipes = response.data
                        $scope.recipeMessage=response.data.message
                    })
                    .catch(function (error) {
                        console.log(error)
                    })
            }

            //gets next page of recipes based on initial parameters
            $scope.nextRecipes = function () {
                let config = {
                    method: 'post',
                    url: 'http://localhost:3000/api/getRecipes/',
                    data: {
                        page: $scope.page + 1,      //increments page #
                        q: $scope.item              //retrieves inital parameter
                    }
                }
                $http(config)
                    .then(function (response) {
                        $scope.recipes = response.data
                    })
                    .catch(function (error) {
                        console.log(error)
                    })
            }

            //goes back to previous page of results
            $scope.prevRecipes = function () {
                let config = {
                    method: 'post',
                    url: 'http://localhost:3000/api/getRecipes/',
                    data: {
                        page: $scope.page - 1,      //decrements page #
                        q: $scope.item              //retrieves initial parameter
                    }
                }
                $http(config)
                    .then(function (response) {
                        $scope.recipes = response.data
                    })
                    .catch(function (error) {
                        console.log(error)
                    })
            }

            //gets stores based on user input
            $scope.findStores = function () {
                let config = {
                    method: 'post',
                    url: 'http://localhost:3000/api/findStores/',
                    data: {
                        SelectedCity: $scope.city,      //retrieves user input
                        SelectedState: $scope.state,    //retrieves user input
                    }
                }
                $http(config)
                    .then(function (response) {
                        $scope.stores = response.data
                        $scope.storeError = null
                    })
                    .catch(function (error) {
                        $scope.storeError = "City or State NOT FOUND"
                    })
            }

            $scope.copyID=function(storeID){
                $scope.storeID=storeID
            }

            //gets ingredients based on user input
            $scope.findIngredient = function () {
                let config = {
                    method: 'post',
                    url: 'http://localhost:3000/api/findIngredient/',
                    data: {
                        StoreId: $scope.storeID,        //retrives user input
                        ItemName: $scope.ingredient     //retrieves user input
                    }
                }
                $http(config)
                    .then(function (response) {
                        $scope.products = response.data
                        $scope.productError = null

                    })
                    .catch(function (error) {
                        $scope.productError = "Invalid input"
                    })
            }
        }
    )
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