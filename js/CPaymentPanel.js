function CPaymentPanel() {
    var _oContainer;
    var _oAmountInput;
    var _oPayButton;
    var _oQrCodeContainer;
    var _oCloseButton;

    this._init = function () {
        _oContainer = new createjs.Container();
        s_oAttachSection.addChild(_oContainer);

        var oBg = new createjs.Shape();
        oBg.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        oBg.alpha = 0.8;
        _oContainer.addChild(oBg);

        // Input jumlah
        var oAmountText = new createjs.Text("Masukkan Jumlah Deposit:", "30px " + FONT_GAME_1, "#ffffff");
        oAmountText.x = CANVAS_WIDTH / 2;
        oAmountText.y = CANVAS_HEIGHT / 2 - 100;
        oAmountText.textAlign = "center";
        _oContainer.addChild(oAmountText);

        _oAmountInput = new CTextInput(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50, 300, 50, _oContainer);
        _oAmountInput.setNumeric(true);

        // Tombol Bayar
        var oSprite = s_oSpriteLibrary.getSprite('but_text');
        _oPayButton = new CSpriteSheetTextButton(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50, oSprite, "Bayar", FONT_GAME_1, "#8d4402", 34, _oContainer);
        _oPayButton.addEventListener(ON_MOUSE_UP, this._onPay, this);

        // Wadah kode QR
        _oQrCodeContainer = new createjs.Container();
        _oQrCodeContainer.visible = false;
        _oContainer.addChild(_oQrCodeContainer);

        _oCloseButton = new CGfxButton(CANVAS_WIDTH - 50, 50, s_oSpriteLibrary.getSprite('but_exit'), _oContainer);
        _oCloseButton.addEventListener(ON_MOUSE_UP, this.unload, this);
    };

    this._onPay = async function () {
        var iAmount = parseInt(_oAmountInput.getValue(), 10);
        if (isNaN(iAmount) || iAmount <= 0) {
            s_oMsgBox.show("Masukkan jumlah yang valid.");
            return;
        }

        const response = await fetch('/api/create-qris-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: iAmount, deviceId: getDeviceId() })
        });
        const data = await response.json();

        if (data.qr_code) {
            this._showQrCode(data.qr_code);
        } else {
            s_oMsgBox.show("Gagal membuat pembayaran.");
        }
    };

    this._showQrCode = function (qrCodeUrl) {
        _oAmountInput.setVisible(false);
        _oPayButton.setVisible(false);
        _oQrCodeContainer.visible = true;

        // Di sini Anda akan menggunakan library untuk membuat kode QR dari URL
        // Untuk saat ini, kita akan menampilkan teks saja
        var oQrText = new createjs.Text("Pindai Kode QR:", "30px " + FONT_GAME_1, "#ffffff");
        oQrText.x = CANVAS_WIDTH / 2;
        oQrText.y = CANVAS_HEIGHT / 2 - 50;
        oQrText.textAlign = "center";
        _oQrCodeContainer.addChild(oQrText);
    };

    this.unload = function () {
        s_oAttachSection.removeChild(_oContainer);
    };

    this._init();
}
