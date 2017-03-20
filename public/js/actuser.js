var app = angular.module('Passreset', ['ui.router', 'ngMaterial', 'ngAnimate', 'ngAria', 'ngMessages',
    'ngSanitize',
    'hljs'
])

.config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('lime')
            .accentPalette('brown');
    })
    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/activateuser/1/2');
            $stateProvider
                .state('activateuser', {
                    url: "/activateuser/:secret/:codedid",
                    templateUrl: "/public/partials/passwordreset.html",
                    controller: function ($scope, $http, $state, $stateParams) {
                        var secret = $stateParams.secret;
                        var codedid = $stateParams.codedid;

                        
                        userUpdate = function (user) {
                            var secques = user.security_question + ":" +
                                user.security_answer;

                            sendConfirmation = function (user) {
                                $http.post('http://localhost:5000/sendconfirmation', {
                                        'email': user.email,
                                    })
                                    .then(function (res) {
                                        console.log("Mail sent");
                                    }, function (e) {
                                        console.log("Mailer failed");
                                    });
                            };

                            $http.put('http://localhost:5000/updateuser', {
                                    'name': user.name,
                                    'user_id': user.user_id,
                                    'fullname': user.fullname,
                                    'email': user.email,
                                    'pass': user.password,
                                })
                                .then(function (res) {
                                    console.log("User updated");
                                    sendConfirmation(user);
                                }, function (e) {
                                    console.log("Update User failed");
                                });
                        };


                        $scope.passReset = function (user) {
                            console.log(user);
                            userUpdate(user);
                        };

                        $http.get('http://localhost:5000/decryptverify/' + secret + "/" + codedid)
                            .then(function (data) {
				u = data.data;
		    		var user_id = u.user_id;
                                getallusers(function (users) {
                                    users.forEach(function (val) {
                                        arr = val.split(',');
                                        id = arr[0];
                                        name = arr[1];
                                        getoneuser(id, function (id, user) {
                                            if (user.user_id == user_id) {
                                                $scope.activateuser = user;
                                            }
                                        });
                                    });
                                });
                            }, function (e) {
                            });

                    }
                });
        }
    ]);
