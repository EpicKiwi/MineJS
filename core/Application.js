function setApplication(pObj, pParams){
    pParams = pParams || {};
    
    if(!pParams.name || !pParams.init || !pParams.onUserOpen || !pParams.onUserClose || !pParams.id){ 
        return false;
    }
    
    pObj.id = pParams.id;
    pObj.name = pParams.name;               
    pObj.description = pParams.description;
    pObj.init = pParams.init;
    pObj.onUserOPen = pParams.onUserOpen;
    pObj.onUserClose  = pParams.onUserClose;
    pObj.needLogin = pParams.needLogin || true;
    pObj.script     = pParams.script;
    
    return true;
}

function ApplicationGui(pParams){
    pParams   = pParams || {};
    this.type = "gui";
    
    if (!setApplication(this, pParams)){
        return false;
    }
    this.iconPath   = pParams.iconPath || "/static/img/defaultIcon.svg"; 
    this.css        = pParams.css;
    this.html       = pParams.html;
    this.style      = pParams.style || {primaryColor: "#005AFF"};
    this.custom     = pParams.custom;
}


function ApplicationBack(pParams){
    
    if (!setApplication(this, pParams)){
        return false;
    }
    
    this.type = "back";
}

exports.back = ApplicationBack;
exports.gui = ApplicationGui;