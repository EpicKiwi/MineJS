var Application = require(__dirname+"/../../core/Application");
var MinecraftServer = require(__dirname+"/../../core/MinecraftServer");
var MineJS = require(__dirname+"/../../core/MineJS");

var chatLog = new Application.back({
	id: 			"chatLog",
	name: 			"ChatLog",
	description: 	"Permet aux joueurs de notifier les admins",

	init: 			function(){
		MinecraftServer.addLogMatch(/<.+> @minejs .+/i,function(mess){
			var message = mess.replace(/<.+> @minejs (.+)/i,"$1");
			MineJS.getIo().emit("notif",{type:"message",message:message});
		});
	},
});

module.exports = chatLog;