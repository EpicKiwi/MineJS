var fs = require('fs');
var yaml = require('js-yaml');

var UserManager = require("./UsersManager");
var ApplicationManager = require("./ApplicationManager");
var MinecraftServer = require("./MinecraftServer");
var SetupManager = require("./SetupManager");
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

	if(this.socket)
	{
		this.socket.emit("gameServerOnlinePlayers",
			{players:MinecraftServer.getOnlinePlayers(),
			playersMax:MinecraftServer.getConfig()["max-players"] || 0});
		this.socket.emit("gameServerState",MinecraftServer.getState());

		if(!SetupManager.isCompletlyInstalled())
		{
			ApplicationManager.open(this,"setup");
		}

		this.socket.on("disconnect",function(){
			log.info("Déconnexion socket");
		})

		this.socket.on("login",function(infos){
			this.username = infos.username;
			this.setPassword(infos.password);
			this.check();
			if(this.trusted)
			{
				log.info(this.username+" c'est connecté");
				this.socket.emit("login",{success: true,infos: this.getInfos()});
			}
			else
			{
				log.warn("Mauvaise identification");
				this.socket.emit("login",{success: false,infos: infos});
			}
		}.bind(this));

		this.socket.on("openApp",function(id){
			ApplicationManager.open(this,id);
		}.bind(this));

		this.socket.on("closeApp",function(){
			ApplicationManager.close(this);
		}.bind(this));

		this.socket.on("toggleGameServer",function(){
			log.info(this.username+" démarre/Arrete le serveur");
			MinecraftServer.toggle();
		}.bind(this));

		this.socket.on("rebootGameServer",function(){
			log.info(this.username+" redémarre le serveur");
			MinecraftServer.reboot();
		}.bind(this));

		this.socket.on("sendCommand",function(command){
			log.info(this.username+" envoie la commande "+command);
			MinecraftServer.sendCommand(command);
		}.bind(this));
	}
};