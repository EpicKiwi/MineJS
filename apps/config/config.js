var log = require(__dirname+"/../../core/Logger");
var Application = require(__dirname+"/../../core/Application");
var MinecraftServer = require(__dirname+"/../../core/MinecraftServer");

var config = new Application.gui({
	id: 			"config",
	name: 			"Config",
	description: 	"Permet la configuration poussée du serveur minecraft",
	needLogin: 		true,
	html: 			"config.html",
	script: 		"configScript.js",
	icon: 			"wrench.svg",
	style: 			{primaryColor: "#00A8FF"},
	custom: 		{},

	init: 			function(){
	},

	onUserOpen: 	function(user){
		this.custom.config = MinecraftServer.getConfig();
		user.socket.on("saveConfigApp",function(config){
			MinecraftServer.setConfig(config);
			MinecraftServer.saveConfig(config);
			user.socket.emit("notif",{type:"info",message:"Il est nécéssaire de redémarrer le serveur pour actualiser les chanegments"});
			user.socket.emit("saveConfigApp",{success:true});
		});
	},

	onUserClose: 	function(user){
	},
});

module.exports = config;