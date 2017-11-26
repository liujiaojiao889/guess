{
    let EVENT_CLICK = Laya.Event.CLICK;

    class Insurance extends ui.Alert.InsuranceUI {
        constructor (data) {
            super();

            this.data = data;

            this.init();
        }

        init () {
            this.insuranceMsg.text = `很可惜，猜错了～获得平安娱乐险，使用后将返还${this.data.paybackPoint}分`;
            
            this.btnClose.on(EVENT_CLICK, this, this.close);
            this.btnUse.on(EVENT_CLICK, this, function () {
                //使用 平安娱乐险
                Sail.io.emit(GAME_CMDS.USE_PROP, {"confirm": confirm, "code": this.data.code}, "ajax");

                Sail.director.closeAll();
            });
        }
    }
    Sail.class(Insurance, "Alert.Insurance");
}