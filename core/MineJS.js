var express = require('express');
var expressApp = express();
var http = require('http').Server(expressApp);
var io = require('socket.io')(http);

var log = require("./Logger");
var setupManager = require("./SetupManager.js");

function init(){
	log.info("Verification de l'installation");
	setupManager.check();

	log.info("Démarrage du serveur web");
	expressApp.use("/static",express.static(__dirname+"/static"));

	expressApp.get("/",function(request,response){
		response.send("Hello world");
	});

	expressApp.get("/debug",function(request, response){
		response.send(JSON.stringify(setupManager.checklist));
	});

	http.listen(80,function(){
		log.info("Ecoute sur *:80");
	});
};

exports.init = init;
exports.io = io;
exports.express = expressApp;