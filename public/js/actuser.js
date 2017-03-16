var app = angular.module('Passreset', ['ui.router', 'ngMaterial', 'ngAnimate', 'ngAria', 'ngMessages',
    'ngSanitize',
    'hljs'
])

.config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('amber')
            .accentPalette('brown');
        $mdThemingProvider.theme('brown')
            .backgroundPalette('brown');
        $mdThemingProvider.theme('dark-blue')
            .backgroundPalette('blue')
            .dark();
    })
    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/activateuser/1/2');
            $stateProvider
                .state('activateuser', {
                    url: "/activateuser/:secret/:codedid",
                    templateUrl: "/public/partials/passwordreset.html",
                    controller: function ($scope, $http, $state, $stateParams, $mdToast) {
                        var secret = $stateParams.secret;
                        var codedid = $stateParams.codedid;

                        $scope.secq = [
                            "Which phone number do you remember most from your childhood?",
                            "What was your favorite place to visit as a child?",
                            "Who is your favorite actor, musician, or artist?",
                            "What is the name of your favorite pet?",
                            "In what city were you born?",
                            "What high school did you attend?",
                            "What is the name of your first school?",
                            "What is your favorite movie?",
                            "What is your mother\'s maiden name?",
                            "What street did you grow up on?",
                            "What was the make of your first car?",
                            "When is your anniversary?",
                            "What is your favorite color?",
                            "What is the name of your first grade teacher?",
                            "What was your high school mascot?",
                            "Which is your favorite web browser?",
                            "What is your favorite website",
                        ];

                        $scope.showSimpleToast = function (msg) {

                            $mdToast.show(
                                $mdToast.simple()
                                .textContent(msg)
                                .position('bottom left')
                                .hideDelay(3000)
                            );
                        };

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
                                    'secques': secques,
                                    'newuser': false
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

                        getallusers = function (cb) {
                            $http.get('http://localhost:5000/getallusers')
                                .then(function (data) {
                                    cb(data.data);
                                }, function (e) {
                                    console.log("GET all users failed");
                                    cb(null);
                                });
                        };

                        getoneuser = function (user_id, cb) {
                            $http.get('http://localhost:5000/getoneuser/' + user_id)
                                .then(function (data) {
                                    cb(user_id, data.data);
                                }, function (e) {
                                    console.log("GET one user failed");
                                    cb(user_id, null);
                                });
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
                                showSimpleToast(e.response);
                            });

                    }
                });
        }
    ]);
