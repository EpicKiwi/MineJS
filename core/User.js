var fs = require('fs');
var yaml = require('js-yaml');

var UserManager = require("./UsersManager");
var ApplicationManager = require("./ApplicationManager");
var log = require("./Logger");

module.exports = function(socket){
	this.socket = socket;
	this.trusted = false;
	this.activeApp = null;
	this.infos = {password: null,roles:[]};

	this.setPassword = function(rawPassword){
		this.infos.password = UserManager.hashString(rawPassword);
	}

	this.check = function(){
		this.trusted = UserManager.check(this.username,this.infos.password);
		if(this.trusted)
		{
			this.infos = UserManager.getInfos(this.username);
		}
	}

	this.save = function(){
		try
		{
			fs.writeFileSync(__dirname+"/../config/users/"+this.username+".yml",yaml.safeDump(this.infos));
			return true;
		}
		catch(e)
		{
			console.trace(e);
		}
		return false;
	}

	this.getInfos = function(){
		return {username: this.username,roles: this.infos.roles};
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
				socket.emit("login",{success: true,infos: this.getInfos()});
			}
			else
			{
				log.warn("Mauvaise identification");
				socket.emit("login",{success: false,infos: infos});
			}
		}.bind(this));

		socket.on("openApp",function(id){
			ApplicationManager.open(this,id);
		}.bind(this));

		socket.on("closeApp",function(){
			ApplicationManager.close(this);
		}.bind(this));
	}
};