var https = require('https');
var fs = require('fs');

var log = require('./Logger');

var releases = [];
var snapshots = [];
var latest = {};

function loadAvaliableVersions(callback)
{
	https.get("https://s3.amazonaws.com/Minecraft.Download/versions/versions.json",function(response){
		var data = "";

		response.on("data",function(chunk){
			data += chunk;
		});

		response.on("end",function(){
			try {
				data = JSON.parse(data);
			} catch (e) {
				log.error("Impossible de recupèrer les versions de minecraft : "+e)
				return false;
			}
			latest = data.latest;

			for(var i = 0;i<data.versions.length; i++)
			{
				if(data.versions[i].type == "release")
				{
					releases.push(data.versions[i].id);
				}
				else if(data.versions[i].type == "snapshot")
				{
					snapshots.push(data.versions[i].id);
				}
			}

			if(callback)
			{
				callback();
			}
		});
	});
};

function downloadLatest(path,callback)
{
	download(latest.release,path,callback);
}

function download(version,path,callback)
{
	log.info("Minecraft : téléchargement du serveur");
	var fileStream = fs.createWriteStream(path+"/minecraft_server."+version+".jar");
	https.get("https://s3.amazonaws.com/Minecraft.Download/versions/"+version+"/minecraft_server."+version+".jar",function(response){

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
			callback();
		});
	});
}

exports.loadAvaliableVersions = loadAvaliableVersions;
exports.download = download;
exports.downloadLatest = downloadLatest;
exports.getReleases = function(){
	return releases;
};
exports.getSnaphots = function(){
	return snapshots;
};
exports.getLatest = function(){
	return latest;
}
