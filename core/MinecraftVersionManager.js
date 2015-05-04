var https = require('https');

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
			data = JSON.parse(data);
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
}

exports.loadAvaliableVersions = loadAvaliableVersions;
exports.getReleases = function(){
	return releases;
};
exports.getSnaphots = function(){
	return snapshots;
};
exports.getLatest = function(){
	return latest;
}