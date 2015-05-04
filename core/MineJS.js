var express = require('express');
var expressApp = express();
var http = require('http').Server(expressApp);
var io = require('socket.io')(http);

expressApp.use("/static",express.static(__dirname+"/static"));

expressApp.get("/",function(request,response){
	response.send("Hello world");
});

function init(){
	http.listen(80);
};

exports.init = init;