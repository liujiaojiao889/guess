{
    let EVENT_CLICK = Laya.Event.CLICK;
    let INIT_DEFAULT_BET_VALUE = false;

    class Bet extends ui.Game.BetUI {
        constructor () {
            super();

            this.maxValue = 0;
            this.gameScore = 0;
            this.TCoin = 0;

            this.init();
        }

        init () {
            this.left = 15;
            this.bottom = 5;
            
            let ACTIONS = {
                [GAME_CMDS.QUERY_USER_INFO] : this.update,
                [GAME_CMDS.PLAY] : this.onResult
            };
            Sail.io.register(ACTIONS, this);

            this.btnDecrease.on(EVENT_CLICK, this, this.calc, ["decrease"]);
            this.btnIncrease.on(EVENT_CLICK, this, this.calc, ["increase"]);
            this.btnMax.on(EVENT_CLICK, this, this.calc, ["max"]);
            this.btnRecharge.on(EVENT_CLICK, this, () => {
                if(!Sail.checkLogin()){return;}
                Laya.SoundManager.playSound("sound/btn.mp3");
                Sail.director.popScene(new Alert.Recharge);
            });
            this.betValue.on(EVENT_CLICK, this, this.showKeyboard);
        }
        showKeyboard () {
            let KEYBOARD_CONFIG = {
                "input" : this.calc.bind(this, "keyboard"),
                "close" : function (type, value) {
                    if(type == "confirm"){
                        this.calc("keyboard", value, true);
                    }
                }.bind(this)
            };
            Sail.keyboard.enter(this.betValue.text, KEYBOARD_CONFIG);
        }
        calc (type, value, confirm) {
            if(!Sail.checkLogin()){return;}

            let step = 100;
            let betValue = this.betValue.text | 0;

            if(type == "max"){betValue = this.maxValue;}

            if (betValue < 10000) {
                step = 100;
            } else if (betValue < 100000) {
                step = 5000;
            } else {
                step = 10000;
            }

            switch(type){
                case "increase":
                    betValue += step;
                    (betValue >= 500000) && (betValue = 500000);
                    break;
                case "decrease":
                    betValue -= step;
                    (betValue <= 100) && (betValue = 100);
                    break;
                case "max":
                    betValue = this.maxValue;
                    betValue = betValue - betValue % step;
                    break;
                case "keyboard":
                    betValue = (value / 100 | 0) * 100;
                    (betValue < 100) && (betValue = 100);
                    if(betValue > 500000 && confirm){
                        betValue = 500000;
                        Sail.director.popScene(new Alert.Public({msg : '<span style="color:#64cee5">超出最大投币额！</span>'}));
                    }
                    break;
            }
            if(type != "keyboard"){
                Laya.SoundManager.playSound("sound/btn.mp3");
            }
            this.betValue.text = betValue;
            Sail.io.publish(GAME_CMDS.GAME_BET_VALUE, betValue);
        }
        update (data) {
            this.gameScore = data.gameScore;
            this.TCoin = data.TCoin;
            this.maxValue = Math.max(data.gameScore, data.TCoin);
            this.maxValue = (this.maxValue / 100 | 0) * 100;
            this.maxValue = Math.min(this.maxValue, 500000);

            if(!USER_LOGIN_STATUS){return;}
            if(INIT_DEFAULT_BET_VALUE){return;}
            INIT_DEFAULT_BET_VALUE = true;

            let defaultBetValue = Math.max(data.gameScore, data.TCoin);
                defaultBetValue = Math.ceil(defaultBetValue / 10000) * 100;
                defaultBetValue = defaultBetValue > 10000 ? 10000 : defaultBetValue;
                defaultBetValue = defaultBetValue < 100 ? 100 : defaultBetValue;

            this.betValue.text = defaultBetValue;
            
            Sail.io.publish(GAME_CMDS.GAME_BET_VALUE, defaultBetValue);

            Laya.timer.once(2000, this, function (defaultBetValue) {
                let msg = `<span style="color:#529eaf;font-size:24px;">（点击投币区域可设置投币额）</span><br><span style="display:none;">1</span><br><span style="color:#64cee5">土豪，您当前的默认投币额为</span><span style="color:#ffd632">${defaultBetValue}</span>`;
                if(isNewUser == "1"){
                    Sail.director.popScene(new Alert.Faq, {onClosed : function () {
                        Sail.director.popScene(new Alert.Public({msg : msg}));
                    }});
                }else{
                    Sail.director.popScene(new Alert.Public({msg : msg}));
                }
            }, [defaultBetValue]);
        }
        onResult (data) {
            if(data.prizeAmount != 0){
                this.gameScore += data.prizeAmount;

                this.maxValue = Math.max(this.gameScore, this.TCoin);
                this.maxValue = (this.maxValue / 100 | 0) * 100;
                this.maxValue = Math.min(this.maxValue, 500000);
            }
        }

        enter () {
            this.enterAni.play(0, false);
        }
    }
    Sail.class(Bet, "Com.Game.BetCtrl");
}