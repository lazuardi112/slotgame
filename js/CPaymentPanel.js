function CPaymentPanel() {
    var _oContainer;

    this._init = function () {
        _oContainer = new createjs.Container();
        _oContainer.alpha = 0;
        s_oAttachSection.addChild(_oContainer);

        var oBg = new createjs.Shape();
        oBg.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        oBg.alpha = 0.7;
        _oContainer.addChild(oBg);

        // Tambahkan UI untuk memasukkan jumlah pembelian dan menampilkan QRIS di sini

        createjs.Tween.get(_oContainer).to({alpha: 1}, 500, createjs.Ease.cubicOut);
    };

    this.unload = function () {
        createjs.Tween.get(_oContainer).to({alpha: 0}, 500, createjs.Ease.cubicOut).call(function () {
            s_oAttachSection.removeChild(_oContainer);
        });
    };

    this._init();
}
