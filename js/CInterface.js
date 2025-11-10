function CInterface(iCurBet,iTotBet,oContainerSlot){
    var _oButExit;
    var _oAudioToggle;	
    var _oButFullscreen;
    var _fRequestFullScreen = null;	
    var _fCancelFullScreen = null;
    
    this._init = function(iCurBet,iTotBet,oContainerSlot){
        // ... (kode inisialisasi lainnya)

        var doc = window.document;	
        var docEl = doc.documentElement;	
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;	
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;	
        	
        if(ENABLE_FULLSCREEN === false){	
            _fRequestFullScreen = false;	
        }	
        	
        if (_fRequestFullScreen && screenfull.isEnabled){	
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');	
            var pStartPosFullscreen = {x: oSprite.width/4 + 10, y: (oSprite.height/2) + 10};
            _oButFullscreen = new CToggle(pStartPosFullscreen.x,pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oAttachSection);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);	
        }	
    };
    
    this._onFullscreenRelease = function(){	
        if(s_bFullscreen) { 	

    };	
    
    // ... (sisa kode CInterface)
}

var s_oInterface = null;
