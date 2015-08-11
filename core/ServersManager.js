var fs = require("fs");
var yaml = require("js-yaml");

var SetupManager = require("./SetupManager");
var log = require("./Logger.js");

var serverTypes = [];

function init()
{
  refreshTypes();
}

function refreshTypes()
{
  serverTypes = [];
  SetupManager.checkFolder(__dirname+"/../customservers");

  try
  {
    var types = fs.readdirSync(__dirname+"/../customservers");

  }
  catch (e)
  {
    log.error("Impossible de lire le dossier des type de serveur : "+e);
  }

  for(var i = 0; i<types.length; i++)
  {
    try
    {
      var type = yaml.safeLoad(fs.readFileSync(__dirname+"/../customservers/"+types[i]))
    }
    catch(e)
    {
      log.error("Erreur de chargement du fichier "+types[i]+" : "+e);
    }
    serverTypes.push(type);
  }
}

function getTypeById(id)
{
  for(var i = 0; i<serverTypes.length; i++)
  {
    if(serverTypes[i].id == id)
    {
      return serverTypes[i]
    }
  }
  return false;
}

exports.init = init;
exports.refresh = refreshTypes;
exports.getTypeById = getTypeById;

exports.getTypes = function(){
  return serverTypes;
}
