var app = angular.module('Activatemail', 
	['ngMaterial', 'ngAnimate', 
	'ngAria', 'ngMessages', 'ui.router']);

app.config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('yellow')
            .accentPalette('brown');
});
     
app.config(function($stateProvider, $urlRouterProvider){  
	$urlRouterProvider.otherwise("/");
    $stateProvider
        .state('default', 
	{ url: "/",
	templateUrl: '/public/partials/adduser.html', 
	controller: 'Activatectrl'}
	);
}).controller('Activatectrl', function($scope, $http){  

	$scope.adduser = function() {
		$http.post('/api/decryptverify/', { name : "Girish"})
			.then(function(resp) {
				alert(resp.data.status);
			}, function(e) {
				alert("Create failed");
			});
			
	};

	$scope.decryptapi = function() {
			$http.post('/api/create', { name : "Girish"})
			.then(function(resp) {
				alert(resp.data.status);
			}, function(e) {
				alert("Create failed");
			});
		
	};

});


