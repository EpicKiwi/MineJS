var UserManager = require("./UsersManager");
var log = require("./Logger");

module.exports = function(socket){
	this.socket = socket;
	this.trusted = false;
	this.infos = {};

	this.setPassword = function(rawPassword){
		this.password = UserManager.hashString(rawPassword);
	}

	this.check = function(){
		this.trusted = UserManager.check(this.username,this.password);
		if(this.trusted)
		{
			this.infos = UserManager.getInfos(this.username);
		}
	}

	if(socket)
	{
		socket.on("disconnect",function(){
			log.info("Déconnexion socket");
		})

		socket.on("login",function(infos){
			this.username = infos.username;
			this.setPassword(infos.password);
			this.check();
			if(this.trusted)
			{
				log.info(this.username+" c'est connecté");
				socket.emit("login",{success: true,infos: this.infos});
			}
			else
			{
				log.warn("Mauvaise identification");
				socket.emit("login",{success: false,infos: infos});
			}
		}.bind(this));
	}
};