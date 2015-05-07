app.controllerProvider.register("minejsAppController",function($scope,socket){
	$scope.tab = 1;
});

app.controllerProvider.register("usersMinejsAppController",function($scope,socket){
	$scope.users = $scope.application.custom.users;
	console.log($scope.users);
});