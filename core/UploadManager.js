var busboy = require('connect-busboy');
var events = require('events');
var fs = require('fs');

var MineJS = require("./MineJS");
var log = require("./Logger");
var UploadedFile = require("./UploadedFile");
var SetupManager = require("./SetupManager");

var emitter = new events.EventEmitter();

var init = function(){
	SetupManager.checkFolder(MineJS.getConfig().uploadTempFolder);
}

var upload = function(request,response)
{
	request.pipe(request.busboy);
	request.busboy.on('file',function(fieldname,file,filename){ 
		var path = __dirname+"/../"+MineJS.getConfig().uploadTempFolder+"/"+filename;
		log.info("Téléchargement : " + filename + " dans "+path);
	  	emitter.emit("uploading",{filename:filename,username:request.params.username});
	  	var upload = new UploadedFile(filename,path);
	  	var fstream = fs.createWriteStream(path);
	  	file.pipe(fstream);
	  	fstream.on('close', function () {
	  	    response.redirect('back');
	  	    emitter.emit("uploaded",{file:upload,username:request.params.username});
	  	});
	})
}

exports.getEmitter = function(){
	return emitter;
}

exports.init = init;
exports.upload = upload;