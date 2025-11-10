function CHistoryPanel() {
    var _oContainer;
    var _oCloseButton;

    this._init = function () {
        _oContainer = new createjs.Container();
        s_oAttachSection.addChild(_oContainer);

        var oBg = new createjs.Shape();
        oBg.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        oBg.alpha = 0.8;
        _oContainer.addChild(oBg);

        var oTitle = new createjs.Text("Riwayat Transaksi", "40px " + FONT_GAME_1, "#ffffff");
        oTitle.x = CANVAS_WIDTH / 2;
        oTitle.y = 100;
        oTitle.textAlign = "center";
        _oContainer.addChild(oTitle);

        // Di sini Anda akan mengambil dan menampilkan data riwayat
        this._loadHistory();

        _oCloseButton = new CGfxButton(CANVAS_WIDTH - 50, 50, s_oSpriteLibrary.getSprite('but_exit'), _oContainer);
        _oCloseButton.addEventListener(ON_MOUSE_UP, this.unload, this);
    };

    this._loadHistory = async function() {
        // Buat titik akhir API untuk mendapatkan riwayat pemain
        // const response = await fetch(`/api/history/${getDeviceId()}`);
        // const data = await response.json();

        // Tampilkan data di sini
    };

    this.unload = function () {
        s_oAttachSection.removeChild(_oContainer);
    };

    this._init();
}
