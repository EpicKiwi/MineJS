var log = require(__dirname+"/../../core/Logger");
var Application = require(__dirname+"/../../core/Application");
var MineJS = require(__dirname+"/../../core/MineJS");
var ApplicationManager = require(__dirname+"/../../core/ApplicationManager");
var UsersManager = require(__dirname+"/../../core/UsersManager");
var User = require(__dirname+"/../../core/User");

var config = new Application.gui({
	id: 			"minejs",
	name: 			"MineJS",
	description: 	"Permet de configurer MineJS",
	needLogin: 		true,
	html: 			"minejs.html",
	script: 		"minejsScript.js",
	css: 			"minejs.css",
	icon: 			"minejs.svg",
	style: 			{primaryColor: "#9FC236"},
	custom: 		{},

	init: 			function(){
	},

	onUserOpen: 	function(user){
		this.custom.users = UsersManager.getUsers();
		this.custom.config = MineJS.getConfig();
		this.custom.version = MineJS.getVersion();

		user.socket.on("createUserMinejsApp",function(infos){
			var newUser = new User();
			newUser.username = infos.username;
			newUser.setPassword(infos.password);
			if(!newUser.isExist())
			{
				newUser.save();
				log.info(user.username+" crée un nouvel utilisateur "+newUser.username);
				user.socket.emit("createUserMinejsApp",{success:true,message:"L'utilisateur a été créé"});
			}
			else
			{
				user.socket.emit("createUserMinejsApp",{success:false,message:"L'utilisateur existe déjà"});
			}
		});

		user.socket.on("deleteUserMinejsApp",function(delUser){
			if(delUser != user.username)
			{
				if(UsersManager.deleteUser(delUser))
				{
					log.info(user.username+" supprimme "+delUser);
					user.socket.emit("deleteUserMinejsApp",{success:true,message:"L'utilisateur a été supprimé"});
				}
				else
				{
					user.socket.emit("notif",{type:"error",message:"Une erreur est survenu durant la suppression"});
					user.socket.emit("deleteUserMinejsApp",{success:false,message:"Une erreur est survenu durant la suppression"});
				}
			}
			else
			{
				user.socket.emit("notif",{type:"error",message:"Vous ne pouvez pas vous supprimmer"});
				user.socket.emit("deleteUserMinejsApp",{success:false,message:"Vous ne pouvez pas vous supprimmer"});
			}
		});

		user.socket.on("saveConfigMinejsApp",function(config){
			MineJS.setConfig(config);
			MineJS.saveConfig();
			user.socket.emit("saveConfigMinejsApp",{success:true,message:"Config sauvegardée"});
			user.socket.emit("notif",{type:"info",message:"Vous devez redemarrer MineJS pour actualiser les changements"});
		});

		user.socket.on("refreshUsersMinejsApp",function(){
			var users = UsersManager.getUsers();
			user.socket.emit("refreshUsersMinejsApp",users);
		});

		user.socket.on("refreshAppsMinejsApp",function(){
			user.socket.emit("refreshAppsMinejsApp",ApplicationManager.getAppsAvaliable());
		});

		user.socket.on("removeAppMinejsApp",function(app){
			ApplicationManager.remove(app.id);
			user.socket.emit("refreshAppsMinejsApp",ApplicationManager.getAppsAvaliable());
			MineJS.getIo().emit("avaliableApps",ApplicationManager.getAppsAvaliable());
		});
	},

	onUserClose: 	function(user){
	},
});

module.exports = config;