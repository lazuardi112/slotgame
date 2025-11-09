//CTL UTILS
function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

function getWebglMaxAnisotropy(){
    var webgl = document.createElement('canvas').getContext('webgl');
    if (!webgl) {
        return;
    }
    var ext = webgl.getExtension('EXT_texture_filter_anisotropic');
    if (!ext) {
        return;
    }
    return webgl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
};

function getParamValue(paramName){
    var url = window.location.search.substring(1); //get rid of "?"
    var qArray = url.split('&'); //get key-value pairs
    for (var i = 0; i < qArray.length; i++)
    {
        var pArr = qArray[i].split('='); //split key and value
        if (pArr[0] === paramName)
            return pArr[1]; //return value
    }
}

function playSound(szSound,iVolume,bLoop){
    if( (DISABLE_SOUND_DESKTOP === false && s_bMobile === false) ||
                                            s_bMobile === true &&  DISABLE_SOUND_MOBILE === false  ){
        s_aSounds[szSound].loop = bLoop;
        s_aSounds[szSound].volume = iVolume;
        if(s_aSounds[szSound].playing() === false){
            s_aSounds[szSound].play();
        }
    }
}

function stopSound(szSound){
    if( (DISABLE_SOUND_DESKTOP === false && s_bMobile === false) ||
                                            s_bMobile === true &&  DISABLE_SOUND_MOBILE === false  ){
        s_aSounds[szSound].stop();
    }
}

function setVolume(szSound,iVolume){
    if( (DISABLE_SOUND_DESKTOP === false && s_bMobile === false) ||
                                            s_bMobile === true &&  DISABLE_SOUND_MOBILE === false  ){
        s_aSounds[szSound].volume(iVolume);
    }
}

function isSoundPlaying(szSound){
    var bRet = false;
    if( (DISABLE_SOUND_DESKTOP === false && s_bMobile === false) ||
                                            s_bMobile === true &&  DISABLE_SOUND_MOBILE === false  ){
        bRet = s_aSounds[szSound].playing();
    }
    return bRet;
}

function createBitmap(oSprite,iWidth,iHeight){
    var oBmp = new createjs.Bitmap(oSprite);
    var aRet = oBmp.getBounds();
    oBmp.regX = (iWidth?iWidth:aRet.width)/2;
    oBmp.regY = (iHeight?iHeight:aRet.height)/2;
    return oBmp;
}

function createSprite(oSpriteSheet,szState,iRegX,iRegY,iWidth,iHeight){
    if(szState === null){
        var oRetSprite = new createjs.Sprite(oSpriteSheet);
    }else{
        var oRetSprite = new createjs.Sprite(oSpriteSheet,szState);
    }

    var aRet = oRetSprite.getBounds();
    oRetSprite.regX = (iWidth?iWidth:aRet.width)/2;
    oRetSprite.regY = (iHeight?iHeight:aRet.height)/2;

    return oRetSprite;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function formatTime(iTime){
        var iMins = Math.floor(iTime/60000);
        var iSecs = Math.floor( (iTime-(iMins*60000))/1000 );
        
        var szRet = "";
        
        if(iMins<10){
            szRet += "0"+iMins+":";
        }else{
            szRet += iMins+":";
        }
        
        if(iSecs<10){
            szRet += "0"+iSecs;
        }else{
            szRet += iSecs;
        }

        return szRet;
}

function NoClickDelay(el) {
	this.element = typeof el == 'object' ? el : document.getElementById(el);
	if( s_bMobile && this.element ){
		this.element.addEventListener('touchstart', this, false);
	}
}

// Intercepts the touch event to prevent the 300ms delay, and dispatches a click instead.
NoClickDelay.prototype.handleEvent = function(e) {
	switch(e.type) {
		case 'touchstart': this.onTouchStart(e); break;
		case 'touchmove': this.onTouchMove(e); break;
		case 'touchend': this.onTouchEnd(e); break;
	}
};

// On touchstart: cache the position and device, then attach the touchmove and touchend listeners.
NoClickDelay.prototype.onTouchStart = function(e) {
	this.element.addEventListener('touchmove', this, false);
	this.element.addEventListener('touchend', this, false);
	this.startX = e.touches[0].clientX;
	this.startY = e.touches[0].clientY;
};

// On touchmove: if the move is greater than 10px on either axis, cancel the click.
NoClickDelay.prototype.onTouchMove = function(e) {
	if(Math.abs(e.touches[0].clientX - this.startX) > 10 || Math.abs(e.touches[0].clientY - this.startY) > 10) {
		this.cancel();
	}
};

// On touchend: if the click has not been cancelled, prevent the default action and dispatch a click.
NoClickDelay.prototype.onTouchEnd = function(e) {
	e.preventDefault();
	this.cancel();
	var theTarget = document.elementFromPoint(this.startX, this.startY);
	if(theTarget.nodeType == 3) theTarget = theTarget.parentNode;

	var theEvent = document.createEvent('MouseEvents');
	theEvent.initEvent('click', true, true);
	theTarget.dispatchEvent(theEvent);
};

// Removes the touchmove and touchend listeners.
NoClickDelay.prototype.cancel = function() {
	this.element.removeEventListener('touchmove', this, false);
	this.element.removeEventListener('touchend', this, false);
};

function CButtonHelper(iX,iY,iWidth,iHeight,oButton,oParentContainer){
    var _oListenerMouseDown;
    var _oListenerMouseUp;
    
    var _aCbCompleted;
    var _aCbOwner;
    
    var _oButton;
    var _oParentContainer;
    var _oHitArea;
    
    this._init = function(iX,iY,iWidth,iHeight,oButton,oParentContainer){
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        _oButton = oButton;
        _oParentContainer = oParentContainer;

        _oHitArea = new createjs.Shape();
        _oHitArea.graphics.beginFill("#0f0f0f").drawRect(-iWidth/2, -iHeight/2, iWidth, iHeight);
        _oHitArea.alpha = 0.01;
        _oHitArea.x = iX;
        _oHitArea.y = iY;
        _oParentContainer.addChild(_oHitArea);

        _oListenerMouseDown = _oHitArea.on("mousedown", this.buttonDown);
        _oListenerMouseUp = _oHitArea.on("pressup" , this.buttonRelease);
    };

    this.unload = function(){
        _oHitArea.off("mousedown",_oListenerMouseDown);
        _oHitArea.off("pressup",_oListenerMouseUp);

        _oParentContainer.removeChild(_oHitArea);
    };

    this.setPosition = function(iX, iY){
        _oHitArea.x = iX;
        _oHitArea.y = iY;
    };

    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
    };

    this.buttonRelease = function(){
        if(_aCbCompleted[ON_MOUSE_UP]){
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP]);
        }
    };

    this.buttonDown = function(){
        if(_aCbCompleted[ON_MOUSE_DOWN]){
            _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN]);
        }
    };

    this._init(iX,iY,iWidth,iHeight,oButton,oParentContainer);
}

function saveItem(szKey,szValue){
    try{
        localStorage.setItem(szKey,szValue);
    }catch(evt){
        // localStorage not defined
        s_bStorageAvailable = false;
    }
}

function getItem(szKey){
    try{
        return localStorage.getItem(szKey);
    }catch(evt){
        // localStorage not defined
        s_bStorageAvailable = false;
    }
}

function clearLocalStorage(){
    if(s_bStorageAvailable){
        localStorage.clear();
    }
}

function sizeHandler(){
    window.scrollTo(0, 1);
    if(!s_oGame) {
            return;
    }


    var h = 1080;
    var w = 1920;

    var exp_w = CANVAS_WIDTH;
    var exp_h = CANVAS_HEIGHT;


    var w_ratio = parseFloat(window.innerWidth/w);
    var h_ratio = parseFloat(window.innerHeight/h);

    var scale_ratio = Math.min(w_ratio,h_ratio);
    var new_width = Math.round(w * scale_ratio);
    var new_height = Math.round(h * scale_ratio);

    s_oCanvas.width = new_width;
    s_oCanvas.height = new_height;

    s_oStage.canvas.width = new_width;
    s_oStage.canvas.height = new_height;


    s_iScale = scale_ratio;
    s_iOffsetX = Math.round( (window.innerWidth - new_width)/2 );
    s_iOffsetY = Math.round( (window.innerHeight - new_height)/2 );

    s_oAttachSection.x = s_iOffsetX;
    s_oAttachSection.y = s_iOffsetY;
    s_oAttachSection.scaleX = s_oAttachSection.scaleY = scale_ratio;



    s_oGame.refreshButtonPos(s_iOffsetX,s_iOffsetY);


    var is_iPad = navigator.userAgent.match(/iPad/i) != null;
    if(isIOS() && !is_iPad){
        if ( (window.innerHeight) > (window.innerWidth) ){
             if( s_oGame !== null && s_oGame.getoGame() !== null && ENABLE_CHECK_ORIENTATION){
                 s_oGame.getoGame().showBlackBg();
             }
        }else{
            if( s_oGame !== null && s_oGame.getoGame() !== null && ENABLE_CHECK_ORIENTATION){
                 s_oGame.getoGame().hideBlackBg();
            }
        }
    }

};

function isMobile() {
        var check = false;
          (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|rim)|playbook|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
}

function isIOS(){
    var iDevices = [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
    ];

    if (!!navigator.platform) {
        while (iDevices.length) {
            if (navigator.platform === iDevices.pop()){ return true; }
        }
    }
    return false;
}
