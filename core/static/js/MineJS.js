var app = angular.module("MineJS",["btford.socket-io"]);

app.config(function($controllerProvider, $compileProvider)
{
    app.controllerProvider = $controllerProvider;
    app.compileProvider    = $compileProvider;
});

app.factory("userFactory",function(){
	return {
		logged: false,
	}
});

app.factory("socket",function(socketFactory){
	return socketFactory();
});

app.controller("globalController",function($scope,userFactory){
	$scope.isLogged = function(){
		return userFactory.logged;
	}
});

app.controller("loginController",function($scope,socket,userFactory){
	$scope.loginFail = false;

	$scope.logIn = function(){
		if($scope.username && $scope.password)
		{
			socket.emit("login",{username: $scope.username,password:$scope.password});
		}
	}

	socket.on("login",function(result){
		if(result.success)
		{
			userFactory.logged = true;
			userFactory.infos = result.user;
			boxOut();
		}
		else
		{
			$scope.loginFail = true;
		}
	});

	function boxOut(){
		var container = jQuery('#login-form');
		var title = container.find("h1");
		var box = container.find(".logBox");

		var timeline = new TimelineMax();
		timeline.to(box,0.2,{opacity:0,scale:0.5,boxShadow:"0 0 0 black"});
		timeline.to(title,0.5,{y: 100,scale:1.5},"-=0.1");
		timeline.to(title,0.5,{opacity:0},"+=3");
		timeline.to(container,0,{display:"none"});
	};

});