function CMenu(){
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var _oBg;
    var _oButPlay;
    var _oAudioToggle;
    var _oButFullscreen;
    var _oFade;
    
    var _oButWithdraw;
    var _oButHistory;
    var _oButDeposit;

    this._init = function(){
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_menu'));
        s_oAttachSection.addChild(_oBg);
        _oBg.alpha = 0.01;

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
        
        var oSprite = s_oSpriteLibrary.getSprite('but_play');
        _oButWithdraw = new CGfxButton(CANVAS_WIDTH/2 - 200, CANVAS_HEIGHT - 100, oSprite, s_oAttachSection);
        _oButWithdraw.addEventListener(ON_MOUSE_UP, this._onWithdraw, this);
        _oButWithdraw.changeText("Tarik Credit");

        _oButHistory = new CGfxButton(CANVAS_WIDTH/2, CANVAS_HEIGHT - 100, oSprite, s_oAttachSection);
        _oButHistory.addEventListener(ON_MOUSE_UP, this._onHistory, this);
        _oButHistory.changeText("Riwayat Credit");

        _oButDeposit = new CGfxButton(CANVAS_WIDTH/2 + 200, CANVAS_HEIGHT - 100, oSprite, s_oAttachSection);
        _oButDeposit.addEventListener(ON_MOUSE_UP, this._onDeposit, this);
        _oButDeposit.changeText("Deposit Credit");

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
        
        _oButWithdraw.unload();
        _oButHistory.unload();
        _oButDeposit.unload();

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }

        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.unload();
        }
        s_oAttachSection.removeChild(_oBg);
        _oBg = null;

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
    
    this._onWithdraw = function(){
        console.log("Withdraw button clicked");
        // Add withdraw logic here
    };

    this._onHistory = function(){
        console.log("History button clicked");
        // Add history logic here
    };

    this._onDeposit = function(){
        console.log("Deposit button clicked");
        // Add deposit logic here
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