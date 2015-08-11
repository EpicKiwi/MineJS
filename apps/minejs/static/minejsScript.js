app.controllerProvider.register("minejsAppController",function($scope,socket,userFactory){
	$scope.tab = 3;
});

app.controllerProvider.register("usersMinejsAppController",function($scope,socket){
	$scope.users = $scope.application.custom.users;
	$scope.form = {};

	socket.on("refreshUsersMinejsApp",function(users){
		$scope.users = users;
	});

	$scope.refreshUsers = function(){
		socket.emit("refreshUsersMinejsApp");
	}

	$scope.deleteUser = function(username){
		socket.emit("deleteUserMinejsApp",username);
		socket.once("deleteUserMinejsApp",function(result){
			if(result.success)
			{
				$scope.refreshUsers();
			}
		})
	}

	$scope.saveUser = function(){
		if($scope.user.username && $scope.user.password && ($scope.user.password == $scope.verif))
		{
			socket.emit("createUserMinejsApp",$scope.user);
			socket.once("createUserMinejsApp",function(result){
				if(result.success)
				{
					$scope.user = {};
					$scope.verif = null;
					$scope.refreshUsers();
					$scope.form.errorMessage = null;
				}
				else
				{
					$scope.user.password = null;
					$scope.verif = null;
					$scope.form.errorMessage = result.message;
				}
			})
		}
	};

});

app.controllerProvider.register("configMinejsAppController",function($scope,socket){
	$scope.config = $scope.application.custom.config;
	$scope.config.gameServerAutoStart = $scope.config.gameServerAutoStart.toString();
	$scope.config.gameServerAcceptEula = $scope.config.gameServerAcceptEula.toString();

	$scope.save = function(){
		$scope.config.gameServerAutoStart = ($scope.config.gameServerAutoStart === 'true');
		$scope.config.gameServerAcceptEula = ($scope.config.gameServerAcceptEula === 'true');
		socket.emit("saveConfigMinejsApp",$scope.config);
		socket.once("saveConfigMinejsApp",function(result){
			if(result.success)
			{
				$scope.saveSuccess = true;
			}
			else
			{
				$scope.saveSuccess = false;
			}
		$scope.config.gameServerAutoStart = $scope.config.gameServerAutoStart.toString();
		$scope.config.gameServerAcceptEula = $scope.config.gameServerAcceptEula.toString();
		});
	};
});

app.controllerProvider.register("appsMinejsAppController",function($scope,socket,FileUploader,userFactory){

	console.log(userFactory);

	socket.emit("refreshAppsMinejsApp");
	$scope.utab = 0;
	$scope.selectedApp = null;
	$scope.showAddApp = false;
	$scope.install = 0;
	$scope.appFile = "";
	$scope.uploader = new FileUploader();
	$scope.uploader.queueLimit = 1;
	$scope.uploader.removeAfterUpload = true;
	$scope.uploader.url="/upload/"+userFactory.infos.username;
	$scope.uploader.filters.push({
		name: "zipRestrict",
		fn: function(item)
		{
			if(item.type == "application/zip"|item.type == "application/x-zip-compressed"|item.type == "application/x-zip")
			{
				return true;
			}
			else
			{
				return false;
			}
		}
	});

	$scope.uploadZip = function(){
		socket.emit("addAppMinejsApp");
		$scope.uploader.uploadAll();
	}

	$scope.goDetails = function(app)
	{
		$scope.selectedApp = app;
		$scope.showAddApp = false;
		$scope.removeq = false;
	}

	$scope.addApp = function(){
		$scope.selectedApp = null;
		$scope.showAddApp = true;
	}

	$scope.removeApp = function(app){
		if($scope.removeConfirm == "supprimer")
		{
			$scope.selectedApp = null;
			socket.emit("removeAppMinejsApp",app);
		}
	}

	$scope.isZip = function(){
		for(item in $scope.uploader.queue)
		{
			if(!(item.type == "application/zip"|item.type == "application/x-zip-compressed"|item.type == "application/x-zip"))
			{
				return false;
			}
		}
		return true;
	}

	socket.on("installingAppMinejsApp",function(file){
		$scope.appFile = file;
		$scope.install = 1
	});

	socket.on("installedAppMinejsApp",function(data){
		if(data.success)
		{
			$scope.install = 2;
		}
		else
		{
			$scope.install = 3;
		}
	});

	socket.on("refreshAppsMinejsApp",function(apps){
		$scope.apps = apps;
		console.log($scope.apps);
	})
});