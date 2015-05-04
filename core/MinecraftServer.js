var cp = require("child_process");
var fs = require("fs");

var MineJS = require("./MineJS");
var log = require("./Logger");

var folder = "";
var executable = null;
var version = null;

function getAbsolutePath()
{
	return __dirname+"/../gamefiles/"+folder;
}

function init()
{
	folder = MineJS.getConfig().gameServerFolder;
	searchExecutable();
	log.log("serveur minecraft : version = "+version+" / executable = "+executable);
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

exports.getPath = getAbsolutePath;
exports.init = init;

exports.getVersion = function(){
	return version;
};