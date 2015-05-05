var MineJS = require("./MineJS");
var MinecraftServer = require("./MinecraftServer");
var log = require("./Logger");

var io = null;
var server = null;

function init(){
	io = MineJS.getIo();
	server = MinecraftServer.getEmitter();

	server.on("load",function(){
		io.emit("gameServerState",MinecraftServer.getState());
	});

	server.on("ready",function(){
		io.emit("gameServerState",MinecraftServer.getState());
	});

	server.on("close",function(){
		io.emit("gameServerState",MinecraftServer.getState());
	});

	server.on("playerConnect",function(playername){
		io.emit("gameServerPlayerConnect",playername);
		io.emit("gameServerOnlinePlayers",
			{players:MinecraftServer.getOnlinePlayers(),
			playersMax:MinecraftServer.getConfig()["max-players"] || 0});
	});

	server.on("playerDisconnect",function(playername){
		io.emit("gameServerPlayerConnect",playername);
		io.emit("gameServerOnlinePlayers",
			{players:MinecraftServer.getOnlinePlayers(),
			playersMax:MinecraftServer.getConfig()["max-players"] || 0});
	});
}

exports.init = init;