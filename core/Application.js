function setApplication(pObj, pParams){
    pParams = pParams || {};
    
    if(!pParams.name || !pParams.init || !pParams.id){ 
        return false;
    }

    pObj.id = pParams.id;
    pObj.name = pParams.name;               
    pObj.description = pParams.description;
    pObj.init = pParams.init;
    
    return true;
}

function ApplicationGui(pParams){
    pParams   = pParams || {};
    this.type = "gui";
    
    if (!setApplication(this, pParams)){
        return false;
    }

    if(pParams.showIcon == undefined)
    {
        pParams.showIcon = true;
    }
    
    if(pParams.needLogin == undefined)
    {
        pParams.needLogin = true;
    }

    this.icon       = pParams.icon || "default"; 
    this.css        = pParams.css;
    this.html       = pParams.html;
    this.style      = pParams.style || {primaryColor: "#005AFF"};
    this.showIcon   = pParams.showIcon;
    this.onUserOpen = pParams.onUserOpen;
    this.onUserClose  = pParams.onUserClose;
    this.script     = pParams.script;
    this.custom     = pParams.custom;
    this.needLogin = pParams.needLogin;
    this.getInfos = function(){
        return {
           id           : this.id,
           name         : this.name,
           description  : this.description,
           iconPath     : this.iconPath,
           css          : this.css,
           html         : this.html,
           script       : this.script,
           style        : this.style,
           custom       : this.custom,
        };
    };
}


function ApplicationBack(pParams){
    
    if (!setApplication(this, pParams)){
        return false;
    }
    
    this.type = "back";
    this.getInfos = function(){
        return {
           id           : this.id,
           name         : this.name,
           description  : this.description,
           script       : this.script,
           custom       : this.custom,
        };
    };
}

exports.back = ApplicationBack;
exports.gui = ApplicationGui;