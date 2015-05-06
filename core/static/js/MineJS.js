var app = angular.module("MineJS",["btford.socket-io"]);

//Permet l'importation de controlleurs
app.config(function($controllerProvider, $compileProvider)
{
    app.controllerProvider = $controllerProvider;
    app.compileProvider    = $compileProvider;
});

//Contiens les informations sur l'utilisateur
app.factory("userFactory",function(){
	return {
		logged: false,
	}
});

//Permet l'utilisation de socket.io
app.factory("socket",function(socketFactory){
	return socketFactory();
});

//Controlleur global
app.controller("globalController",function($scope,socket,userFactory){
	$scope.isLogged = function(){
		return userFactory.logged;
	}

	$scope.isDisplayable = function(value,index){
		console.log(value,index);
	}

	$scope.openApp = function(id){
		socket.emit("openApp",id);
	}

	$scope.closeApp = function(){
		socket.emit("closeApp");
	}

	$scope.getIconPath = function(file,appId){
		if(file == "default")
		{
			return "/static/img/burst.svg";
		}
		else
		{
			return "/app/"+appId+"/"+file;
		}
	}

	socket.on("avaliableApps",function(apps){
		$scope.avaliableApps = apps;
	});
});

//Controlleur de la boite de connexion
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

app.controller("appController",function($scope,$timeout,$interpolate,socket){

	$scope.state = "off";
	$scope.application = null;
	$scope.dynamicCss = {};

	socket.on("openApp",function(appInfos){
		if(appInfos.script)
		{
			jQuery.getScript("/app/"+appInfos.id+"/"+appInfos.script,function(){
				continueLoad();
			}).fail(function(jqxhr, settings, exception){
				console.error("Erreur de chargement de l'app : "+exception.message);
				console.error(exception.stack);
			});
		}
		else
		{
			continueLoad();
		}

		function continueLoad(){
			$scope.application = appInfos;
			$scope.updateCss();
			$timeout(function(){
				$scope.state = "on";
			},19);
		}
	});

	socket.on("closeApp",function(){
		$scope.state = "off";
		$timeout(function(){
			$scope.application = null;
		},500);
	});

	$scope.updateCss = function()
	{
		jQuery("#app style").each(function(index,element){
			var exp = $interpolate($scope.dynamicCss[jQuery(element).attr("id")]);
			jQuery(element).html(exp($scope));
		});
	}

	$scope.loadedCss = function(id)
	{
		var css = jQuery("#"+id+" span").html();
		$scope.dynamicCss[id] = css;
		jQuery("#"+id+" span").html("<style id='"+id+"' >"+css+"</style>");
		$scope.updateCss();
	}

	$scope.getStaticPath = function(file)
	{
		if($scope.application)
		{
			return "/app/"+$scope.application.id+"/"+file;
		}
		else
		{
			return false;
		}
	}

});

app.controller("controlBarController",function($scope,socket){
	$scope.serverStates = [{icon:"x",text:"Hors ligne"},
						   {icon:"loop",text:"Démarrage"},
						   {icon:"check",text:"En ligne"},
						   {icon:"minus",text:"Inconnu"}];
	$scope.actualState = 3;

	$scope.toggleMenu = function(menuId){
		if($scope.activeMenu == menuId)
		{
			$scope.activeMenu = null;
		}
		else
		{
			$scope.activeMenu = menuId;
		}
	}

	$scope.toggleGameServer = function(){
		socket.emit("toggleGameServer");
	}

	$scope.rebootGameServer = function(){
		socket.emit("rebootGameServer");
	}

	$scope.sendCommand = function(command){
		if(command)
		{
			$scope.command = null;
			socket.emit("sendCommand",command);
		}
	}

	socket.on("gameServerState",function(state){
		$scope.actualState = state;
	});

	socket.on("gameServerOnlinePlayers",function(infos){
		$scope.onlinePlayers = infos;
	});
});