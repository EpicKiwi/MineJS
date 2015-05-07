var log = require(__dirname+"/../../core/Logger");
var Application = require(__dirname+"/../../core/Application");
var UsersManager = require(__dirname+"/../../core/UsersManager");

var config = new Application.gui({
	id: 			"minejs",
	name: 			"MineJS",
	description: 	"Permet de configurer MineJS",
	needLogin: 		true,
	html: 			"minejs.html",
	script: 		"minejsScript.js",
	icon: 			"minejs.svg",
	style: 			{primaryColor: "#9FC236"},
	custom: 		{},

	init: 			function(){
	},

	onUserOpen: 	function(user){
		this.custom.users = UsersManager.getUsers();
	},

	onUserClose: 	function(user){
	},
});

module.exports = config;