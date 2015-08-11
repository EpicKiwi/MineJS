var fs = require("fs");
var express = require("express");

var log = require("./Logger");
var MineJS = require("./MineJS");

var appsAvaliable = [];

function init(){

	appsFiles = searchApps();

	for(var i = 0; i<appsFiles.length; i++)
	{
		addApp(appsFiles[i]);
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

	return appsFiles;

};

function refreshApps(){
	appsFiles = searchApps();
	for(var i = 0; i<appsFiles.length; i++)
	{
		var finded = false;
		for(var j = 0; j<appsAvaliable.length; j++)
		{
			if(appsAvaliable[j].id == appsFiles[i])
			{
				finded = true;
			}
		}
		if(!finded)
		{
			log.log("Nouvelle app : "+appsFiles[i]);
			addApp(appsFiles[i]);
		}
	}
}

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
		else if(e.code == "ENOTDIR")
		{
			log.error("Le fichier "+id+" n'est pas un dossier");
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
		appsAvaliable.push(app);
		MineJS.getExpress().use("/app/"+id,express.static(__dirname+"/../apps/"+id+"/static"));
		appsAvaliable[appsAvaliable.indexOf(app)].init()
	}
	else
	{
		log.error("L'application "+id+" ne correspond pas au schéma d'une application MineJS");
	}
};

function openApp(user,id)
{
	var app = getApp(id);
	if(app)
	{
		if(user.activeApp == null)
		{
			if(user.trusted || !app.needLogin)
			{
				app.onUserOpen(user);
				user.socket.emit("openApp",app.getInfos());
				user.activeApp = app;
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

function getApp(id)
{
	for(var i = 0; i<appsAvaliable.length;i++)
	{
		if(appsAvaliable[i].id == id)
		{
			return appsAvaliable[i];
		}
	}
	return false;
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

function remdirRecursiveSync(path) {
  if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file,index) {
        var curPath = path + "/" + file;
          if(fs.statSync(curPath).isDirectory()) {
              remdirRecursiveSync(curPath);
          } else {
              fs.unlinkSync(curPath);
          }
      });
      fs.rmdirSync(path);
    }
};

function removeApp(id)
{
	try
	{
		remdirRecursiveSync(__dirname+"/../apps/"+id);
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

	appsAvaliable = [];
	appsFiles = searchApps();
	for(var i = 0; i<appsFiles.length; i++)
	{
		addApp(appsFiles[i]);
	}
}

exports.init = init;
exports.open = openApp;
exports.close = closeApp;
exports.add = addApp;
exports.remove = removeApp;
exports.searchApps = searchApps;
exports.refreshApps = refreshApps;
exports.getAppsAvaliable = function(){
	return appsAvaliable;
}
