app.controllerProvider.register("configAppController",function($scope,socket){
	$scope.tab = 1;
	$scope.config = $scope.application.custom.config;
	$scope.config["max-players"] = parseInt($scope.config["max-players"],10);
	$scope.config["max-build-height"] = parseInt($scope.config["max-build-height"],10);
	$scope.config["server-port"] = parseInt($scope.config["server-port"],10);
	$scope.config["player-idle-timeout"] = parseInt($scope.config["player-idle-timeout"],10);
	$scope.config["view-distance"] = parseInt($scope.config["view-distance"],10);
	$scope.config["max-world-size"] = parseInt($scope.config["max-world-size"],10);
	$scope.config["max-tick-time"] = parseInt($scope.config["max-tick-time"],10);

	$scope.save = function(){
		socket.emit("saveConfigApp",$scope.config)
		socket.once("saveConfigApp",function(result){
			if(result.success){
				$scope.saved = true;
			}
		});
	};
});