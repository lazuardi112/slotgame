function CMenu(){

    var _oAudioToggle;
    var _oButFullscreen;
    var _oFade;
    
    var _oButWithdraw;
    var _oButHistory;
    var _oButDeposit;

    this._init = function(){

        var oSpriteLogo = s_oSpriteLibrary.getSprite("logo_menu");
        var oLogo = createBitmap(oSpriteLogo);
        oLogo.regX = oSpriteLogo.width/2;
        oLogo.regY = oSpriteLogo.height/2;
        oLogo.x = CANVAS_WIDTH/2;
        oLogo.y = CANVAS_HEIGHT/2-150;
        s_oAttachSection.addChild(oLogo);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_play');
        _oButPlay = new CGfxButton((CANVAS_WIDTH/2),CANVAS_HEIGHT - 350,oSprite,s_oAttachSection);
        _oButPlay.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);

        var oSprite = s_oSpriteLibrary.getSprite('but_text');
        _oButBuyCredit = new CSpriteSheetTextButton((CANVAS_WIDTH/2) - 300, CANVAS_HEIGHT - 150, oSprite, "Deposit Kredit", FONT_GAME_1, "#8d4402", 34, s_oAttachSection);
        _oButBuyCredit.addEventListener(ON_MOUSE_UP, this._onBuyCredit, this);

        _oButWithdraw = new CSpriteSheetTextButton((CANVAS_WIDTH/2), CANVAS_HEIGHT - 150, oSprite, "Tarik Kredit", FONT_GAME_1, "#8d4402", 34, s_oAttachSection);
        _oButWithdraw.addEventListener(ON_MOUSE_UP, this._onWithdraw, this);

        _oButHistory = new CSpriteSheetTextButton((CANVAS_WIDTH/2) + 300, CANVAS_HEIGHT - 150, oSprite, "Riwayat Kredit", FONT_GAME_1, "#8d4402", 34, s_oAttachSection);
        _oButHistory.addEventListener(ON_MOUSE_UP, this._onHistory, this);

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSpriteAudio = s_oSpriteLibrary.getSprite('audio_icon');
            var pStartPosAudio = {x: CANVAS_WIDTH - (oSpriteAudio.width/4) - 10, y: (oSpriteAudio.height/2) + 10};
            _oAudioToggle = new CToggle(pStartPosAudio.x,pStartPosAudio.y,oSpriteAudio,s_bAudioActive);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }
        

        var doc = window.document;
        var docEl = doc.documentElement;
        var fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            fRequestFullScreen = false;
        }
        
        if (fRequestFullScreen && screenfull.isEnabled){
            var oSpriteFullscreen = s_oSpriteLibrary.getSprite('but_fullscreen');
            var pStartPosFullscreen = {x: oSpriteFullscreen.width/4 + 10, y: (oSpriteFullscreen.height/2) + 10};
            _oButFullscreen = new CToggle(pStartPosFullscreen.x,pStartPosFullscreen.y,oSpriteFullscreen,s_bFullscreen,s_oAttachSection);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        s_oAttachSection.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha:0}, 400).call(() => {_oFade.visible = false;});
    };
    
    this.unload = function(){
        _oButPlay.unload(); 
        _oButBuyCredit.unload();
        _oButWithdraw.unload();
        _oButHistory.unload();
        

            _oButFullscreen.unload();
        }
        
        s_oAttachSection.removeAllChildren();
        s_oMenu = null;
    };
    

    this._onButPlayRelease = function(){
        this.unload();
        s_oMain.gotoGame();
    };

    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };


    this._onFullscreenRelease = function(){
        if(s_bFullscreen) { 
            screen.orientation.unlock();
		    _fCancelFullScreen.call(window.document);
	    } else {
		    _fRequestFullScreen.call(window.document.documentElement);
            if(s_bMobile){
                screen.orientation.lock("landscape");
            }
	    }
	    s_bFullscreen = !s_bFullscreen;
    };


    s_oMenu = this;
    
    this._init();
}

var s_oMenu = null;
