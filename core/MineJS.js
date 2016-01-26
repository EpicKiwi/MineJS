var express = require('express');
var expressApp = express();
var http = require('http').Server(expressApp);
var io = require('socket.io')(http);
var fs = require("fs");
var yaml = require("js-yaml");
var busboy = require('connect-busboy');

var log = require("./Logger");
var SetupManager = require("./SetupManager");
var MinecraftServer = require("./MinecraftServer");
var UsersManager = require("./UsersManager");
var ApplicationManager = require("./ApplicationManager");
var BroadcastManager = require("./BroadcastManager");
var UploadManager = require("./UploadManager");
var User = require("./User");
var ServersManager = require("./ServersManager");

var config = {
	port: 3000
};
var version = "0.2.0-beta";

function init(){
	log.info("Verification de l'installation");
	SetupManager.check();

	log.info("Chargement de la configuration")
	loadConfig();
	BroadcastManager.init();

	log.info("Chargement des types de serveur")
	ServersManager.init();

	log.info("Initialisation du systeme d'upload");
	UploadManager.init();

	log.info("Initialisation du serveur Minecraft");
	MinecraftServer.init();

	log.info("Initialisation des applications");
	ApplicationManager.init();

	log.info("Démarrage du serveur web");
	//Dossier des fichiers stiques (JS/CSS/IMG)
	expressApp.use("/static",express.static(__dirname+"/static"));

	expressApp.use(busboy());

	//URL principal
	expressApp.get("/",function(request,response){
		response.sendFile(__dirname+"/html/index.html");
	});

	//URL de debug non utilisée en prod
	expressApp.get("/debug",function(request, response){
		response.send(JSON.stringify(ApplicationManager.getAppsAvaliable()));
	});

	expressApp.post("/upload/:username",function(request,response){
		UploadManager.upload(request,response);
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
		config = yaml.safeLoad(fs.readFileSync("./core/defaults/config.yml",{encoding:"utf8"}));
	}
	catch(e)
	{
		log.warn("Aucune configuration trouvée chargement de la configuration par défaut");
		config = yaml.safeLoad(fs.readFileSync("./core/defaults/config.yml",{encoding:"utf8"}));
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
};

exports.getVersion = function(){
	return version;
};

exports.getConfig = function(){
	return config;
};

exports.setConfig = function(value){
	config = value;
};
