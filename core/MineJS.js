var express = require('express');
var expressApp = express();
var http = require('http').Server(expressApp);
var io = require('socket.io')(http);
var fs = require("fs");
var yaml = require("js-yaml");

var log = require("./Logger");
var SetupManager = require("./SetupManager");
var MinecraftServer = require("./MinecraftServer");
var UsersManager = require("./UsersManager");
var ApplicationManager = require("./ApplicationManager");
var BroadcastManager = require("./BroadcastManager");
var User = require("./User");

var config = {};

function init(){
	log.info("Verification de l'installation");
	SetupManager.check();

	log.info("Chargement de la configuration")
	loadConfig();
	ApplicationManager.init();
	BroadcastManager.init();

	log.info("Initialisation du serveur Minecraft");
	MinecraftServer.init();

	log.info("Démarrage du serveur web");
	//Dossier des fichiers stiques (JS/CSS/IMG)
	expressApp.use("/static",express.static(__dirname+"/static"));

	//URL principal
	expressApp.get("/",function(request,response){
		response.sendFile(__dirname+"/html/index.html");
	});

	//URL de debug non utilisée en prod
	expressApp.get("/debug",function(request, response){
		response.send(JSON.stringify(SetupManager.getChecklist()));
	});

	//Initialisation des sockets
	io.on("connection",function(socket){
		log.info("Connexion socket");
		var user = new User(socket);
	});
	//Démarrage du serveur
	http.listen(config.port,function(){
		log.info("Ecoute sur *:"+config.port);
	});
};

function loadConfig(){
	try
	{
		config = yaml.safeLoad(fs.readFileSync(__dirname+"/../config/config.yml",{encoding:"utf8"}));
	}
	catch(e)
	{
		log.warn("Aucune configuration trouvée chargement de la configuration par défaut");
		config = yaml.safeLoad(fs.readFileSync(__dirname+"/defaults/config.yml",{encoding:"utf8"}));
	}
}

function saveConfig(){
	try
	{
		fs.writeFileSync(__dirname+"/../config/config.yml",yaml.safeDump(config));
	}
	catch(e)
	{
		console.trace(e);
	}
}

exports.init = init;
exports.saveConfig = saveConfig;

exports.getIo = function(){
	return io;
};

exports.getExpress = function(){
	return expressApp;
};;

exports.getConfig = function(){
	return config;
};

exports.setConfig = function(value){
	config = value;
};