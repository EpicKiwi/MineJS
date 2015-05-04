var cp = require("child_process");
var fs = require("fs");
var events = require('events');

var MineJS = require("./MineJS");
var log = require("./Logger");
var VersionsManager = require('./MinecraftVersionManager');

var folder = "";
var executable = null;
var version = null;
var ram = 2048;
var process = null;
var running = false;
var emitter = new events.EventEmitter();
var lastCommand = null;
var onlinePlayers = [];

function getAbsolutePath()
{
	return __dirname+"/../gamefiles/"+folder;
}

function init()
{
	VersionsManager.loadAvaliableVersions(function(){
		folder = MineJS.getConfig().gameServerFolder;
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
			log.error("Le dossier "+folder+" n'exste pas");
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

exports.getPath = getAbsolutePath;
exports.init = init;
exports.run = run;
exports.sendCommand = sendCommand;
exports.isOutdated = isOutdated;

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