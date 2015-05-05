var log = require(__dirname+"/../../core/Logger");
var Application = require(__dirname+"/../../core/Application");
var User = require(__dirname+"/../../core/User");
var MineJS = require(__dirname+"/../../core/MineJS");
var MinecraftServer = require(__dirname+"/../../core/MinecraftServer");

var setup = new Application.gui({
	id: 			"setup",
	name: 			"Installation",
	description: 	"L'application permettant d'initialiser MineJS et d'installer un serveur Minecraft",
	needLogin: 		false,
	html: 			"setup.html",
	css: 			"setup.css",
	style: 			{primaryColor: "#9FC236"},
	script: 		"setupScript.js",
	custom: 		{},

	init: 			function(){
	},

	onUserOpen: 	function(user){
		this.custom.config = MineJS.getConfig();

		user.socket.on("createAdminSetupApp",function(infos){
			var admin = new User();
			admin.username = infos.username;
			admin.setPassword(infos.password);
			admin.save();
			user.socket.emit("createAdminSetupApp",{success:true});
		});

		user.socket.on("saveConfigSetupApp",function(config){
			MineJS.setConfig(config);
			MineJS.saveConfig();
			MinecraftServer.updateFolder();
			user.socket.emit("saveConfigSetupApp",{success:true});
		});

		user.socket.on("installServerSetupApp",function(){
			MinecraftServer.install(function(){
				user.socket.emit("installServerSetupApp",{success:true});
			});
		});
	},

	onUserClose: 	function(user){
		user.socket.removeAllListeners("createAdminSetupApp");
		user.socket.removeAllListeners("saveConfigSetupApp");
	},
});

module.exports = setup;