var log = require(__dirname+"/../../core/Logger");
var Application = require(__dirname+"/../../core/Application");

var setup = new Application.gui({
	id: 			"setup",
	name: 			"Installation",
	description: 	"L'application permettant d'initialiser MineJS et d'installer un serveur Minecraft",
	needLogin: 		false,
	html: 			"setup.html",
	css: 			"setup.css",
	style: 			{primaryColor: "#9FC236"},

	init: 			function(){
		log.info("Application "+this.name+" chargée");
	},

	onUserOpen: 	function(user){
		log.info(user.infos.username+" ouvre l'application setup");
	},

	onUserClose: 	function(user){
		log.info(user.infos.username+" a fermé l'application setup");
	},
});

module.exports = setup;