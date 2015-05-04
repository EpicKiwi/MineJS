var cp = require("child_process");

var MineJS = require("./MineJS");

var folder = "";

function getAbsolutePath()
{
	return __dirname+"/../gamefiles/"+folder;
}

function init()
{
	folder = MineJS.getConfig().gameServerFolder;
}

exports.getPath = getAbsolutePath;
exports.init = init;