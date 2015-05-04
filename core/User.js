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
		socketListeners(socket);
	}
};

function socketListeners(socket){
	socket.on("disconnect",function(){
		log.info("Déconnexion socket");
	})
}