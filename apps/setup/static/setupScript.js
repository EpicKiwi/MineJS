app.controllerProvider.register("setupAppController",function($scope){
	$scope.tab = 1;
	$scope.loading = {state: false,message: "préparation des lamas"};

	$scope.nextStep = function(){
		$scope.tab++;
	}

	$scope.prevStep = function(){
		$scope.tab--;
	}
});

app.controllerProvider.register("adminSetupAppController",function($scope,socket){
	$scope.admin = {};

	$scope.createAdmin = function(){
		if($scope.admin.username && $scope.admin.password && ($scope.admin.password == $scope.passwordVerif))
		{
			socket.emit("createAdminSetupApp",$scope.admin)
			socket.once("createAdminSetupApp",function(result){
				if(result.success)
				{
					$scope.nextStep();
				}
			});
		}
	}
});

app.controllerProvider.register("configMineJSSetupAppController",function($scope,socket){
	$scope.application.custom.config.gameServerAutoStart = $scope.application.custom.config.gameServerAutoStart.toString();
	$scope.application.custom.config.gameServerAcceptEula = $scope.application.custom.config.gameServerAcceptEula.toString();

	$scope.saveConfig = function(){
		$scope.application.custom.config.gameServerAutoStart = ($scope.application.custom.config.gameServerAutoStart === 'true');
		$scope.application.custom.config.gameServerAcceptEula = ($scope.application.custom.config.gameServerAcceptEula === 'true');
		socket.emit("saveConfigSetupApp",$scope.application.custom.config)
		socket.once("saveConfigSetupApp",function(result){
			if(result.success)
			{
				$scope.nextStep();
			}
		});
	};
});

app.controllerProvider.register("installServerSetupAppController",function($scope,socket){

	$scope.installServer = function(){
		$scope.loading.state = true;
		$scope.loading.message = "Nous installons votre serveur. Prenez un café ;-)"
		socket.emit("installServerSetupApp");
		socket.once("installServerSetupApp",function(result){
			if(result.success)
			{
				$scope.nextStep();
			}
			$scope.loading.state = false;
		});
	};

});