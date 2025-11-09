function CSpriteSheetTextButton(iXPos,iYPos,oSprite,szText,szFont,szColor,iFontSize,oParentContainer){

    var _bDisable;

    var _iWidth;
    var _iHeight;

    var _aCbCompleted;
    var _aCbOwner;
    
    var _oButton;
    var _oText;
    var _oButtonHelper;
    
    this._init =function(iXPos,iYPos,oSprite,szText,szFont,szColor,iFontSize,oParentContainer){
        _bDisable = false;

        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        var oButtonSprite = createSprite(oSprite," ",0,0,oSprite.width/2,oSprite.height);

        var iStep = 0;
        var iWidth = oSprite.width/2;
        var iHeight = oSprite.height;
        var oData = {
                        images: [oSprite],
                        // width, height & registration point of each sprite
                        frames: {width: iWidth, height: iHeight, regX: iWidth/2, regY: iHeight/2},
                        animations: {state_true:[0],state_false:[1]}
                   };

        var oSpriteSheet = new createjs.SpriteSheet(oData);
	_oButton = createSprite(oSpriteSheet,"state_true",iWidth/2,iHeight/2,iWidth,iHeight);
        _oButton.x = iXPos;
        _oButton.y = iYPos;
        _oButton.stop();
        oParentContainer.addChild(_oButton);
        
        _oButtonHelper = new CButtonHelper(iXPos,iYPos,oSprite.width/2,oSprite.height,_oButton,oParentContainer);
        _oButtonHelper.addEventListener(ON_MOUSE_UP, this.buttonRelease, this);
        _oButtonHelper.addEventListener(ON_MOUSE_DOWN, this.buttonDown, this);
        
        _oText = new CTLText(oParentContainer,
                    iXPos-iWidth/2, iYPos-iHeight/2, iWidth, iHeight,
                    iFontSize, "center", szColor, szFont, 1,
                    0, 0,
                    szText,
                    true, true, true,
                    false );
    };
    
    this.unload = function(){
        _oButton.off("mousedown");
        _oButton.off("pressup");
        oParentContainer.removeChild(_oButton);
        oParentContainer.removeChild(_oText);
    };
    
    this.setVisible = function(bVisible){
        _oButton.visible = bVisible;
        _oText.setVisible(bVisible);
    };
    
    this.enable = function(){
        _bDisable = false;
        
	_oButton.gotoAndStop("state_true");
    };
    
    this.disable = function(){
        _bDisable = true;
        
	_oButton.gotoAndStop("state_false");
    };
    
    this.setPosition = function(iX,iY){
        _oButton.x = iX;
        _oButton.y = iY;

        _oText.setX(iX);
        _oText.setY(iY);
    };
    
    this.setText = function(szText){
        _oText.refreshText(szText);
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.buttonRelease = function(){
        if(_bDisable){
            return;
        }

        playSound("press_but",1,false);

        _oButton.scaleX = 1;
        _oButton.scaleY = 1;

        if(_aCbCompleted[ON_MOUSE_UP]){
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP]);
        }
    };
    
    this.buttonDown = function(){
        if(_bDisable){
            return;
        }
        _oButton.scaleX = 0.9;
        _oButton.scaleY = 0.9;

       if(_aCbCompleted[ON_MOUSE_DOWN]){
           _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN]);
       }
    };
    
    this._init(iXPos,iYPos,oSprite,szText,szFont,szColor,iFontSize,oParentContainer);
}