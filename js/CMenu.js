function CMenu(){
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    var _pStartPosCredits;
    var _pStartPosDelete;
    
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    var _oButPlay;

    var _oAudioToggle;

    var _oButFullscreen;
    var _oFade;

    
    this._init = function(){
        var oSpriteLogo = s_oSpriteLibrary.getSprite("logo_menu");
        var oLogo = createBitmap(oSpriteLogo);
        oLogo.regX = oSpriteLogo.width/2;
        oLogo.regY = oSpriteLogo.height/2;
        oLogo.x = CANVAS_WIDTH/2;
        oLogo.y = CANVAS_HEIGHT/2-150;
        oLogo.alpha = 0;
        oLogo.scale = 0;
        s_oAttachSection.addChild(oLogo);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_play');
        _oButPlay = new CGfxButton((CANVAS_WIDTH/2),CANVAS_HEIGHT -250,oSprite,s_oAttachSection);
        _oButPlay.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);

        var oSprite = s_oSpriteLibrary.getSprite('but_text');
        _oButBuyCredit = new CSpriteSheetTextButton((CANVAS_WIDTH/2) - 250,CANVAS_HEIGHT -150,oSprite,"Beli Kredit",FONT_GAME_1,"#8d4402",34,s_oAttachSection);
        _oButBuyCredit.addEventListener(ON_MOUSE_UP, this._onBuyCredit, this);

        _oButWithdraw = new CSpriteSheetTextButton((CANVAS_WIDTH/2) + 250,CANVAS_HEIGHT -150,oSprite,"Tarik Kredit",FONT_GAME_1,"#8d4402",34,s_oAttachSection);
        _oButWithdraw.addEventListener(ON_MOUSE_UP, this._onWithdraw, this);


        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.width/4) - 4, y: (oSprite.height/2) + 4};   
            
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }
        

        _pStartPosFullscreen = {x:(oSprite.width/2) + 4,y:(oSprite.height/2) + 4};
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oAttachSection);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        

        if(!s_bStorageAvailable){
            s_oMsgBox.show(TEXT_ERR_LS);
        }
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        
        s_oAttachSection.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha:0}, 400).call(function(){_oFade.visible = false;});  
        
        this.refreshButtonPos ();
        
        createjs.Tween.get(oLogo).to({alpha:1}, 800,createjs.Ease.quintOut); 
        createjs.Tween.get(oLogo).to({scale:1}, 800,createjs.Ease.backOut); 
    };
    
    this.unload = function(){
        _oButPlay.unload(); 
        _oButPlay = null;
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.unload();
        }

        s_oAttachSection.removeChild(_oFade);
        _oFade = null;
        
        s_oMenu = null;
    };
    
    this.refreshButtonPos = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - s_iOffsetX,s_iOffsetY + _pStartPosAudio.y);
        }

        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX,_pStartPosFullscreen.y + s_iOffsetY);
        }
    };
    
    this._onButPlayRelease = function(){
        this.unload();
        $(s_oMain).trigger("start_session");
        s_oMain.gotoGame();
    };

    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this.resetFullscreenBut = function(){
	if (_fRequestFullScreen && screenfull.isEnabled){
		_oButFullscreen.setActive(s_bFullscreen);
	}
    };

    this._onFullscreenRelease = function(){
        if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();
    };
    
    s_oMenu = this;
    
    this._init();
}

var s_oMenu = null;