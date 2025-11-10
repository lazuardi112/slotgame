function CInterface(iCurBet,iTotBet,oContainerSlot){
    var _aLinesBut;
    var _aPayline;
    var _oSpinBut;
    var _oInfoBut;
    var _oAddLineBut;
    var _oBetCoinBut;
    var _oAutoSpinBut;
    var _oButExit;
    var _oMoneyText;
    var _oTotalBetText;
    var _oWinText;
    var _oAudioToggle;	
    var _oButFullscreen;
    var _oAreYouSurePanel;	

    this._init = function(iCurBet,iTotBet,oContainerSlot){
        var oSprite = s_oSpriteLibrary.getSprite('but_text');

        _oSpinBut = new CSpriteSheetTextButton(0,0,oSprite,TEXT_SPIN,FONT_GAME_1,"#8d4402",34,oContainerSlot);
        _oSpinBut.addEventListener(ON_MOUSE_UP, this._onSpin, this);

        _oBetCoinBut = new CSpriteSheetTextButton(0,0,oSprite,TEXT_COIN +" " + formatEntries(iCurBet),FONT_GAME_1,"#8d4402",34,oContainerSlot);
        _oBetCoinBut.addEventListener(ON_MOUSE_UP, this._onBet, this);
        
        _oAddLineBut = new CSpriteSheetTextButton(0,0,oSprite,TEXT_LINES + " " + NUM_PAYLINES,FONT_GAME_1,"#8d4402",34,oContainerSlot);
        _oAddLineBut.addEventListener(ON_MOUSE_UP, this._onAddLine, this);
        
        _oAutoSpinBut = new CSpriteSheetTextButton(0,0,oSprite,TEXT_AUTO_SPIN,FONT_GAME_1,"#8d4402",34,oContainerSlot);
        _oAutoSpinBut.addEventListener(ON_MOUSE_UP, this._onAutoSpin, this);
        
        _oInfoBut = new CSpriteSheetTextButton(0,0,oSprite,TEXT_PAYTABLE,FONT_GAME_1,"#8d4402",34,oContainerSlot);
        _oInfoBut.addEventListener(ON_MOUSE_UP, this._onInfo, this);

	_oMoneyText = new CTLText(oContainerSlot, 0, 0, 278, 30, 30, "left", "#ffba00", FONT_GAME_1, 1, 0, 0, TEXT_MONEY +": " + TEXT_CURRENCY + " " + formatEntries(TOTAL_MONEY), true, true, false, false );
	_oTotalBetText = new CTLText(oContainerSlot, 0, 0, 278, 30, 30, "center", "#ffba00", FONT_GAME_1, 1, 0, 0, TEXT_BET +": "+TEXT_CURRENCY + " " +formatEntries(iTotBet), true, true, false, false );
        _oWinText = new CTLText(oContainerSlot, 0, 0, 278, 30, 30, "right", "#ffba00", FONT_GAME_1, 1, 0, 0, TEXT_WIN + ": " + TEXT_CURRENCY + " 0", true, true, false, false );

        var oSpriteExit = s_oSpriteLibrary.getSprite("but_exit");	
        _oButExit = new CGfxButton(0,0,oSpriteExit,s_oAttachSection);
        _oButExit.addEventListener(ON_MOUSE_UP,this._onExit,this);	
        	
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){	
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');	
            _oAudioToggle = new CToggle(0,0,oSprite,s_bAudioActive,s_oAttachSection);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);	
        }

        var doc = window.document;	
        var docEl = doc.documentElement;	
        var _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullScreen;
        var _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        if(ENABLE_FULLSCREEN && _fRequestFullScreen && screenfull.isEnabled){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');	
            _oButFullscreen = new CToggle(0,0,oSprite,s_bFullscreen,s_oAttachSection);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);	
        }	
        	
        _oAreYouSurePanel = new CAreYouSurePanel();	
        _oAreYouSurePanel.addEventListener(ON_BUT_YES_DOWN,this._onExitYes,this);	

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        var iBottomOffset = 120;
        _oSpinBut.setPosition(CANVAS_WIDTH / 2, CANVAS_HEIGHT - iBottomOffset);
        _oBetCoinBut.setPosition((CANVAS_WIDTH / 2) - 250, CANVAS_HEIGHT - iBottomOffset);
        _oAddLineBut.setPosition((CANVAS_WIDTH / 2) + 250, CANVAS_HEIGHT - iBottomOffset);
        _oInfoBut.setPosition(_oBetCoinBut.getX() - 250, CANVAS_HEIGHT - iBottomOffset);
        _oAutoSpinBut.setPosition(_oAddLineBut.getX() + 250, CANVAS_HEIGHT - iBottomOffset);
        
        _oMoneyText.setPosition(20, 20);
        _oTotalBetText.setPosition(CANVAS_WIDTH / 2, 20);
        _oWinText.setPosition(CANVAS_WIDTH - 20, 20);

        _oButExit.setPosition(CANVAS_WIDTH - (oSprite.width/2) - 10 - iNewX, (oSprite.height/2) + 10 + iNewY);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){	
            _oAudioToggle.setPosition(10 + (oSprite.width/4) + iNewX, (oSprite.height/2) + 10 + iNewY);
        }	
        if (_fRequestFullScreen && screenfull.isEnabled){	
            _oButFullscreen.setPosition(_oAudioToggle.getX() + oSprite.width/2 + 10, (oSprite.height/2) + 10 + iNewY);
        }	
    };      
    
    this.unload = function(){
        _oSpinBut.unload();
        _oInfoBut.unload();
        _oAddLineBut.unload();
        _oBetCoinBut.unload();
        _oAutoSpinBut.unload();
        _oButExit.unload();
        _oAreYouSurePanel.unload();
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){	
            _oAudioToggle.unload();	
        }	
        if (_fRequestFullScreen && screenfull.isEnabled){	
            _oButFullscreen.unload();	
        }
      
        s_oInterface = null;
    };

    // ... (sisa kode tetap sama)
}

var s_oInterface = null;