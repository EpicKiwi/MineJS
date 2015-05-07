var log = require(__dirname+"/../../core/Logger");
var Application = require(__dirname+"/../../core/Application");
var MinecraftServer = require(__dirname+"/../../core/MinecraftServer");

var config = new Application.gui({
	id: 			"minejs",
	name: 			"MineJS",
	description: 	"Permet de configurer MineJS",
	needLogin: 		true,
	html: 			null, //"minejs.html",
	script: 		null, //"configScript.js",
	icon: 			"minejs.svg",
	style: 			{primaryColor: "#9FC236"},
	custom: 		{},

	init: 			function(){
	},

	onUserOpen: 	function(user){
	},

	onUserClose: 	function(user){
	},
});

module.exports = config;