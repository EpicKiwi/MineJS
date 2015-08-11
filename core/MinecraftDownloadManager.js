var https = require('https');
var http = require('http');
var fs = require('fs');
var unzip = require('unzip');

var log = require('./Logger');

var releases = [];
var snapshots = [];
var latest = {};

function download(type,path,callback)
{
	log.info("Minecraft : téléchargement du serveur");
	var fileStream = fs.createWriteStream(path+"/downloaded.tmp");

	if(type.downloadProtocol == "http")
	{
		http.get(type.download,onResponse);
	}
	else if(type.downloadProtocol == "https")
	{
		https.get(type.download,onResponse);
	}
	else
	{
		log.error("Protocole "+type.downloadProtocol+" non supporté");
	}

	function onResponse(response){

		if(response.statusCode == 200)
		{
			response.pipe(fileStream);
		}
		else
		{
			log.error("Minecraft : Impossible de télécharger le serveur, erreur de connexion code "+response.statusCode);
			return false;
		}

		response.on("end",function(){
			if(type.downloadType == "application/java-archive")
			{
				fs.renameSync(path+"/downloaded.tmp", path+"/"+type.executable);
				callback();
			}
			else if(type.downloadType == "application/zip")
			{
				fs.createReadStream(path+"/downloaded.tmp").pipe(unzip.Extract({ path: path }))
					.on("close",function(){
						callback();
					});
			}
			else
			{
					log.error("Impossible de déterminer l'opération à éfféctuer sur le fichier téléchargé");
			}
		});
	}
}

exports.download = download;
