var cp = require("child_process");
var fs = require("fs");

var MineJS = require("./MineJS");
var log = require("./Logger");

var folder = "";
var executable = null;
var version = null;
var ram = 2048;
var process = null;
var running = false;

function getAbsolutePath()
{
	return __dirname+"/../gamefiles/"+folder;
}

function init()
{
	folder = MineJS.getConfig().gameServerFolder;
	searchExecutable();
	if(MineJS.getConfig().gameServerAutoStart)
	{
		run();
	}
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
	log.info("Démarrage du serveur minecraft");
	running = true;
	process = cp.spawn("java",["-Xmx"+ram+"M","-Xms"+ram+"M","-jar",executable,"nogui"],{cwd:getAbsolutePath()});
	process.stdout.setEncoding("UTF-8");

	var line = "";
	process.stdout.on("data",function(data){
		line += data;
		if(data.search(/\r\n/i) != -1)
		{
			line = line.replace(/(.*)\r\n/i,"$1");
			log.log("Minecraft : "+line);
			line = "";
		}
	});

	process.on("close",function(){
		running = false;
		log.info("Serveur Minecraft étein");
	});
}


function sendCommand(command){
	if(running)
	{
		process.stdin.write(command+"\n");
		log.info("Commande "+command+" envoyée au serveur");
	}
	else
	{
		log.error("La commande "+command+" ne peut etre envoyée car le serveur n'est pas démarré");
	}
};

exports.getPath = getAbsolutePath;
exports.init = init;
exports.run = run;

exports.getVersion = function(){
	return version;
};

exports.isRunning = function(){
	return running;
}