{
    let EVENT_CLICK = Laya.Event.CLICK;

    class Public extends ui.Alert.PublicUI {
        constructor (config) {
            super();

            this.selfConfig = config;
            this.init();
        }

        init () {
            this.update();
            this.resize();
            this.bindEvent();
        }
        update () {
            this.alertMsg.style.align = "center";
            this.alertMsg.style.fontSize = 32;
            this.alertMsg.innerHTML = this.selfConfig.msg;
        }
        resize () {
            this.alertMsg.height = this.alertMsg.contentHeight;
            this.height = this.alertMsg.height + this.alertMsg.y + 180;
        }
        bindEvent () {
            this.btnClose.on(EVENT_CLICK, this, this.close);
            this.btnConfirm.on(EVENT_CLICK, this, function () {
                this.selfConfig.close && this.selfConfig.close();
                this.close();
            });
        }
    }
    Sail.class(Public, "Alert.Public");
}