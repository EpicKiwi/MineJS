var fs = require("fs");
var express = require("express");

var log = require("./Logger");
var MineJS = require("./MineJS");

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
		MineJS.getExpress().use("/app/"+id,express.static(__dirname+"/../apps/"+id+"/static"));
	}
	else
	{
		log.error("L'application "+id+" ne correspond pas au schéma d'une application MineJS");
	}
};

function openApp(user,id)
{
	if(appsAvaliable[id])
	{
		if(user.activeApp == null)
		{
			if(user.trusted || !appsAvaliable[id].needLogin)
			{
				appsAvaliable[id].onUserOpen(user);
				user.socket.emit("openApp",appsAvaliable[id].getInfos());
				user.activeApp = appsAvaliable[id];
			}
			else
			{
				log.warn("L'application "+id+" requiere une authentification");
				user.socket.emit("notif",{type:"error",message:"Vous devez tout d'abort vous connecter"});
			}
		}
		else
		{
			user.socket.emit("notif",{type:"info",message:"Fermez tout d'abort l'application "+user.activeApp.name});
		}
	}
	else
	{
		log.error("L'application "+id+" n'existe pas");
	}
}

function closeApp(user)
{
	if(user.activeApp != null)
	{
		user.activeApp.onUserClose(user);
		user.socket.emit("closeApp");
		user.activeApp = null;
	}
	else
	{
		user.socket.emit("notif",{type:"info",message:"Aucune application lancée"});
	}
}

exports.init = init;
exports.open = openApp;
exports.close = closeApp;
exports.getAppsAvaliable = function(){
	return appsAvaliable;
}