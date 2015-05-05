var fs = require("fs");

var log = require("./Logger");

var appsAvaliable = {};

function init(){

	searchApps();

	for(var app in appsAvaliable)
	{
		appsAvaliable[app].init();
	}

};

function searchApps(){
	try
	{
		var appsFiles = fs.readdirSync(__dirname+"/../apps");
	}
	catch(e)
	{
		if(e.code == "ENOENT")
		{
			log.error("Le dossier d'applications n'existe pas");
		}
		else
		{
			console.trace(e)
		}
		return false;
	}

	for(var i = 0; i<appsFiles.length; i++)
	{
		addApp(appsFiles[i]);
	}

};

function addApp(id){
	try
	{
		var appFolder = fs.readdirSync(__dirname+"/../apps/"+id);
	}
	catch(e)
	{
		if(e.code == "ENOENT")
		{
			log.error("Le dossier de l'application "+id+" n'existe pas");
		}
		else
		{
			console.trace(e)
		}
		return false;
	}

	if(appFolder.indexOf(id+".js") == -1)
	{
		log.error("Le fichier principal "+id+".js est manquant");
		return false;
	}

	var app = require(__dirname+"/../apps/"+id+"/"+id);
	if(app)
	{
		appsAvaliable[id] = app;
	}
	else
	{
		log.error("L'application "+id+" ne correspond pas au schéma d'une application MineJS");
	}
};

exports.init = init;
exports.getAppsAvaliable = function(){
	return appsAvaliable;
}