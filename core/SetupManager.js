var fs = require("fs");
var log = require("./Logger");

var installChecklist = {
	config     : false,
	users      : false,
	gameServer : false,
};

function checkSetup()
{
	createFileSystem();
	installChecklist.config = checkFile(__dirname+"/../config/config.yml");
	installChecklist.users = checkUsers();
	installChecklist.gameServer = checkGameServer();
};

function checkUsers()
{
	try
	{
		var users = fs.readdirSync(__dirname+"/../config/users");
		if(users.length > 0)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	catch(e)
	{
		if(e.code == "ENOENT")
		{
			log.warn("Le dossier utilisateurs n'existe pas");
			return false;
		}
		else
		{
			console.trace(e);
		}
	}
}

function checkGameServer()
{
	try
	{
		var users = fs.readdirSync(__dirname+"/../gamefiles");
		if(users.length > 0)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	catch(e)
	{
		if(e.code == "ENOENT")
		{
			log.warn("Le dossier gamefiles n'existe pas");
			return false;
		}
		else
		{
			console.trace(e);
		}
	}
}

function checkFile(path)
{
	try
	{
		fs.accessSync(path);
	}
	catch(e)
	{
		if(e.code == "ENOENT")
		{
			return false;
		}
		else
		{
			console.trace(e);
		}
	}
	return true;
}

function createFileSystem()
{
	checkFolder(__dirname+"/../config");
	checkFolder(__dirname+"/../config/users");
	checkFolder(__dirname+"/../gamefiles");
	checkFolder(__dirname+"/../apps");
};

function checkFolder(path)
{
	try
	{
		fs.accessSync(path);
	}
	catch(e)
	{
		if(e.code == "ENOENT")
		{
			log.warn("Le dossier "+path+" n'existe pas. Création ...");
			fs.mkdirSync(path);
		}
		else
		{
			console.trace(e);
		}
	}
}

function isCompletlyInstalled()
{
	for(var elem in installChecklist)
	{
		if(!installChecklist[elem])
		{
			return false;
		}
	}
	return true;
}

exports.isCompletlyInstalled = isCompletlyInstalled;
exports.checklist = installChecklist;
exports.check = checkSetup;