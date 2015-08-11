var log = require(__dirname+"/../../core/Logger");
var Application = require(__dirname+"/../../core/Application");
var User = require(__dirname+"/../../core/User");
var MineJS = require(__dirname+"/../../core/MineJS");
var MinecraftServer = require(__dirname+"/../../core/MinecraftServer");
var SetupManager = require(__dirname+"/../../core/SetupManager");
var ApplicationManager = require(__dirname+"/../../core/ApplicationManager");
var ServersManager = Application.get("ServersManager");

var setup = new Application.gui({
	id: 			"setup",
	name: 			"Installation",
	description: 	"L'application permettant d'initialiser MineJS et d'installer un serveur Minecraft",
	needLogin: 		false,
	showIcon: 		false,
	html: 			"setup.html",
	css: 			"setup.css",
	style: 			{primaryColor: "#9FC236"},
	script: 		"setupScript.js",
	custom: 		{},

	init: 			function(){
	},

	onUserOpen: 	function(user){
		if(SetupManager.isCompletlyInstalled())
		{
			user.socket.emit("notif",{type:"error",message:"MineJS est déjà installé"});
			setTimeout(function() {
				ApplicationManager.close(user);
			}, 500);
			return false;
		}
		this.custom.config = MineJS.getConfig();
		this.custom.serverTypes = ServersManager.getTypes();
		this.custom.gameServerConfig = MinecraftServer.getConfig();

		user.socket.on("createAdminSetupApp",function(infos){
			var admin = new User();
			admin.username = infos.username;
			admin.setPassword(infos.password);
			admin.save();
			SetupManager.getChecklist().users = true;
			user.socket.emit("createAdminSetupApp",{success:true});
		});

		user.socket.on("saveConfigSetupApp",function(config){
			MineJS.setConfig(config);
			MineJS.saveConfig();
			MinecraftServer.updateFolder();
			SetupManager.getChecklist().config = true;
			user.socket.emit("saveConfigSetupApp",{success:true});
		});

		user.socket.on("installServerSetupApp",function(typeId){
			var config = MineJS.getConfig();
			config.serverType = ServersManager.getTypeById(typeId)
			MineJS.setConfig(config);
			MineJS.saveConfig();
			MinecraftServer.setType(ServersManager.getTypeById(typeId));
			MinecraftServer.install(function(){
				user.socket.emit("gameServerConfigSetupApp",MinecraftServer.getConfig());
				SetupManager.getChecklist().gameServer = true;
				user.socket.emit("installServerSetupApp",{success:true});
			});
		});

		user.socket.on("updateGameServerConfigSetupApp",function(config){
			MinecraftServer.setConfig(config);
			MinecraftServer.saveConfig(config);
			user.socket.emit("updateGameServerConfigSetupApp",{success:true});
		});
	},

	onUserClose: 	function(user){
		user.socket.removeAllListeners("createAdminSetupApp");
		user.socket.removeAllListeners("saveConfigSetupApp");
		user.socket.removeAllListeners("installServerSetupApp");
		user.socket.removeAllListeners("updateGameServerConfigSetupApp");
	},
});

module.exports = setup;
