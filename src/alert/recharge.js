{
    let EVENT_CLICK = Laya.Event.CLICK;
    let EVENT_FOCUS = Laya.Event.FOCUS;

    let VALUES = ["10", "50", "100", "500"];

    class Recharge extends ui.Alert.RechargeUI {
        constructor () {
            super();

            this.init();
        }
        init () {
            let tabItems = this.rechargeTab.items;
            for(let i in tabItems){
                tabItems[i].getChildByName("value").text = VALUES[i] + "元";
            }

            this.rechargeValue.on(EVENT_FOCUS, this, this.showKeyboard);
            this.btnRecharge.on(EVENT_CLICK, this, this.recharge);
            this.rechargeTab.selectHandler = new Laya.Handler(this, function (index) {
                if(index == -1){return;}
                
                this.rechargeValue.text = VALUES[index];
            });
        }
        onKeyboardInput (value) {
            this.rechargeValue.text = value;
            for(let i in VALUES){
                if(VALUES[i] == value){
                    this.rechargeTab.selectedIndex = i;
                    return;
                }
            }
            this.rechargeTab.selectedIndex = -1;
        }
        showKeyboard () {
            let KEYBOARD_CONFIG = {
                "length" : 8,
                "input" : this.onKeyboardInput.bind(this),
                "close" : function (type, value) {
                    if(type === "confirm"){
                        this.onKeyboardInput(value);
                    }
                }.bind(this)
            };
            Sail.keyboard.enter(this.rechargeValue.text, KEYBOARD_CONFIG);
        }
        recharge () {
            if(!this.rechargeValue.text){return;}

            let url = `/?act=payment&gameId=${gameId}&tradeName=${tradeName}&amount=${this.rechargeValue.text}&platform=${platform}&redirect_uri=${redirect_uri}`;

            window.location.href = url;
        }
    }
    Sail.class(Recharge, "Alert.Recharge");
}