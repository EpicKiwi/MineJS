var cp = require("child_process");
var fs = require("fs");
var events = require('events');

var MineJS = require("./MineJS");
var log = require("./Logger");
var VersionsManager = require('./MinecraftVersionManager');
var SetupManager = require("./SetupManager");

var folder = "";							//Dossier contenant le serveur
var executable = null;						//Executable du serveur
var version = null;							//Version du serveur
var ram = 2048;								//Ram alouée au serveur
var process = null;							//Objet child-process associé au serveur
var running = false;						//Le serveur est il allymé
var state = 0;								//Etat du serveur : 0 etein, 1 chargement, 2 pret
var emitter = new events.EventEmitter();	//Emetteur d'evenement du serveur
var lastCommand = null;						//Derniere commande envoyée au serveur
var onlinePlayers = [];						//Joueurs en ligne
var config = {};							//Configuration global du serveur(server.properties)
var logMatches = []							//Les ecouteurs de log personnalisés
var type = null;

function getAbsolutePath()
{
	return __dirname+"/../gamefiles/"+folder;
}

function init()
{
	VersionsManager.loadAvaliableVersions(function(){
		folder = MineJS.getConfig().gameServerFolder;
		loadConfig();
		searchExecutable();
		eventDispatcher();
		if(MineJS.getConfig().gameServerAutoStart)
		{
			run();
		}
	});
}

function searchExecutable()
{
	try
	{
		var files = fs.readdirSync(getAbsolutePath());
	}
	catch(e)
	{
		if(e.code == "ENOENT")
		{
			log.warn("Minecraft Le dossier "+folder+" n'exste pas, une installation est nécéssaire");
		}
		else
		{
			console.trace(e);
		}
		return false;
	}

	for(var i = 0; i<files.length; i++)
	{
		if(files[i].search(/minecraft_server\.(.*)\.(exe|jar)/i) > -1)
		{
			executable = files[i];
			version = files[i].replace(/minecraft_server\.(.*)\.(exe|jar)/i,"$1");
			return true;
		}
	}

	log.error("Aucun executable de serveur trouvé");

}

function run()
{
	log.info("Minecraft : Démarrage du serveur");
	state = 1;
	emitter.emit("load");
	running = true;
	process = cp.spawn("java",["-Xmx"+ram+"M","-Xms"+ram+"M","-jar",executable,"nogui"],{cwd:getAbsolutePath()});
	process.stdout.setEncoding("UTF-8");

	var line = "";
	process.stdout.on("data",function(data){
		line += data;
		if(data.search(/\r\n/i) != -1)
		{
			line = line.replace(/(.*)\r\n/i,"$1");
			analyzeLine(line);
			line = "";
		}
	});

	process.on("close",function(){
		running = false;
		state = 0;
		emitter.emit("close");
		log.info("Minecraft : Serveur etein");
	});
}


function sendCommand(command){
	if(running)
	{
		lastCommand = command;
		process.stdin.write(command+"\n");
		log.info("Minecraft : Commande "+command);
	}
	else
	{
		log.error("Minecraft : La commande "+command+" ne peut etre envoyé quand le serveur est étein");
	}
};

function analyzeLine(line)
{
	line = line.replace(/\[..\:..\:..\] \[.*\/(.*)\].*: (.*)/i,"$1#$2").split("#");
	emitter.emit("log",line[1]);
	switch(line[0])
	{
		case "INFO":
			log.log("Minecraft : "+line[1]);
			emitter.emit("info",line[1]);
		break;
		case "WARN":
			log.warn("Minecraft : "+line[1]);
			emitter.emit("warning",line[1]);
		break;
		case "ERROR":
			log.error("Minecraft : "+line[1]);
			emitter.emit("error",line[1]);
		break;
	}
}

function eventDispatcher(){
	emitter.on("info",function(message){
		if(message.search(/Done \(.*\)/i) != -1)
		{
			state = 2;
			log.info("Minecraft : Serveur pret");
			emitter.emit("ready");
		}
		else if(message.search(/Unknown command/i) != -1)
		{
			log.error("Minecraft : Commande "+lastCommand+" inconnue");
			emitter.emit("badCommand",lastCommand);
		}
		else if(message.search(/(.*) joined the game/i) != -1)
		{
			var playerName = message.replace(/(.*) joined the game/i,"$1");
			log.info("Minecraft : Connexion de "+playerName);
			onlinePlayers.push(playerName);
			emitter.emit("playerConnect",playerName);
		}
		else if(message.search(/(.*) left the game/i) != -1)
		{
			var playerName = message.replace(/(.*) left the game/i,"$1");
			log.info("Minecraft : Deconnexion de "+playerName);
			onlinePlayers.splice(onlinePlayers.indexOf(playerName),1);
			emitter.emit("playerDisconnect",playerName);
		}
	});

	emitter.on("log",function(message){
		for(var i =0;i<logMatches.length;i++)
		{
			if(message.search(logMatches[i].match) != -1)
			{
				logMatches[i].callback(message);
			}
		}
	});
}

function isOutdated(){
	if(VersionsManager.getLatest().release == version)
	{
		return false;
	}
	else
	{
		return true;
	}
}

function setEula(state){
	fs.writeFileSync(getAbsolutePath()+"/eula.txt","eula="+state);
}

function generateConfig(callback){
	run();
	emitter.once("ready",function(){
		stop();
		emitter.once("close",function(){
			callback();
		})
	});
}

function stop(){
	sendCommand("stop");
}

function reboot(){
	sendCommand("stop");
	emitter.once("close",function(){
		run();
	});
}

function toggle(){
	if(running)
	{
		stop();
	}
	else
	{
		run();
	}
}

function install(callback){
	SetupManager.checkFolder(getAbsolutePath());
	if(MineJS.getConfig().gameServerAcceptEula)
	{
		log.info("Minecraft : EULA Automatiquement acceptée");
		setEula(true);
	}
	VersionsManager.downloadLatest(getAbsolutePath(),function(){
		if(MineJS.getConfig().gameServerAcceptEula)
		{
			searchExecutable();
			log.info("Minecraft : Génération de la configuration");
			generateConfig(function(){
				log.info("Minecraft : serveur opérationnel");
				loadConfig();
				if(callback){
					callback();
				}
			});
		}
	});
}

function update(){
	if(isOutdated())
	{
		VersionsManager.downloadLatest(getAbsolutePath(),function(){
			try
			{
				fs.unlinkSync(getAbsolutePath()+"/"+executable);
			}
			catch(e)
			{
				console.trace(e);
			}
			searchExecutable();
			log.info("Minecraft : Serveur mis a jour");
		});
	}
	else
	{
		log.info("Minecraft : Le serveur est déjà à jour");
	}
}

function loadConfig(){
	try
	{
		var configFile = fs.readFileSync(getAbsolutePath()+"/server.properties",{encoding:"utf8"});
	}
	catch(e)
	{
		if(e.code == "ENOENT")
		{
			log.warn("Minecraft Impossible de charger la configuration, le fichier server.properties n'existe pas");
		}
		else
		{
			console.trace(e);
		}
		return false;
	}

	configFile = configFile.split("\r\n");

	for(var i = 0; i<configFile.length; i++)
	{
		if(configFile[i].search(/#.*/) == -1)
		{
			var line = configFile[i].split("=");
			config[line[0]] = line[1];
		}
	}
	return true;
}

function saveConfig(){
	var data = "";
	for(var propery in config)
	{
		data += propery+"="+config[propery]+"\r\n";
	}

	try
	{
		fs.writeFileSync(getAbsolutePath()+"/server.properties",data);
	}
	catch(e)
	{
		if(e.code == "ENOENT")
		{
			log.warn("Minecraft Impossible de charger la configuration, le fichier server.properties n'existe pas");
		}
		else
		{
			console.trace(e);
		}
		return false;
	}

}

function addLogMatch(reg,callback)
{
	var match = {match:reg,callback:callback};
	logMatches.push(match);
	return logMatches.indexOf(match);
}

function removeLogMatch(id)
{
	if(logMatches[id])
	{
    	array.splice(id, 1);
	}
	else
	{
		log.error("Le logMatch d'id "+id+" n'existe pas");
	}
}

exports.getPath = getAbsolutePath;
exports.init = init;
exports.run = run;
exports.stop = stop;
exports.toggle = toggle;
exports.reboot = reboot;
exports.sendCommand = sendCommand;
exports.isOutdated = isOutdated;
exports.install = install;
exports.update = update;
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.addLogMatch = addLogMatch;
exports.removeLogMatch = removeLogMatch;

exports.getVersion = function(){
	return version;
};

exports.isRunning = function(){
	return running;
}

exports.getEmitter = function(){
	return emitter;
}

exports.getOnlinePlayers = function(){
	return onlinePlayers;
}

exports.updateFolder = function(){
	folder = MineJS.getConfig().gameServerFolder;
}

exports.getConfig = function(){
	return config;
}

exports.setConfig = function(value){
	config = value;
}

exports.getState = function(){
	return state;
}
