{
    let EVENT_CLICK = Laya.Event.CLICK;
    
    class Header extends ui.Game.HeaderUI {
        constructor (type, data) {
            super();
            this.menu = null;
            this.betValue = 0;
            this.init(type, data);
        }

        init (data) {
            this.centerX = 0;

            let ACTIONS = {
                [GAME_CMDS.QUERY_USER_INFO] : this.update,
                [GAME_CMDS.PLAY] : this.onResult,
                [GAME_CMDS.GAME_BET_VALUE] : this.onBet
            };
            Sail.io.register(ACTIONS, this);
            
            this.btnRecharge.on(EVENT_CLICK, this, function () {
                if(!Sail.checkLogin()){return;}
                Laya.SoundManager.playSound("sound/btn.mp3");
                Sail.director.popScene(new Alert.Recharge);
            });

            this.btnRank.on(EVENT_CLICK, this, function () {
                Laya.SoundManager.playSound("sound/btn.mp3");
                Sail.director.popScene(new Alert.Rank);
            });
            this.btnNotice.on(EVENT_CLICK, this, function () {
                if(window.GM && GM.noticePopShow_out){
                    Laya.SoundManager.playSound("sound/btn.mp3");
                    GM.noticePopShow_out();
                }
            });

            // 豆哥按钮绑定事件
            this.showGameScore.on(EVENT_CLICK, this, function(){
                if(window.GM && GM.isCall_out === 1 && GM.popBalanceShow_out){
                    Laya.SoundManager.playSound("sound/btn.mp3");
                    this.noticeDot.visible = false;
                    GM.popBalanceShow_out();
                }
            });

            this.btnBack.on(Laya.Event.CLICK, null, function () {
                Laya.SoundManager.playSound("sound/btn.mp3");
                GM.btnBackCall_out();
            });

            this.btnHome.on(EVENT_CLICK, this, function () {
                Laya.SoundManager.playSound("sound/btn.mp3");
                location.href = GM.backHomeUrl;
            });

            // Laya 系统公告, 默认是隐藏的
            if(window.GM && GM.isCall_out === 1 && GM.noticeStatus_out){
                GM.noticeStatus_out(function(data){
                    data = data || {};
                    // 是否显示系统公告
                    if(data.isShowNotice){
                        // 显示系统公告按钮
                        this.btnNotice.visible = true;
                    }

                    // 是否需要显示小红点
                    if(data.isShowRedPoint){
                        this.noticeDot.visible = true;
                    }
                }.bind(this));
            }

            if (window.GM && GM.isCall_out === 1 && GM.isShowBtnBack_out && GM.btnBackCall_out) {
				this.btnBack.visible = true; // 显示返回按钮
			};

            if(GM.backHomeUrl != ""){
				this.btnHome.disabled = false; // 显示返回按钮
			}

            this.menu = new Com.Game.Menu();
            this.addChild(this.menu);
        }

        update (data) {
            this.tCoin.text = data.TCoin;
            this.gameScore.text = data.gameScore;
        }
        onBet (value) {
            console.log("header onBetValue");
            this.betValue = value;
        }
        onResult (data) {
            let tCoin = this.tCoin.text | 0;
            let gameScore = this.gameScore.text | 0;

            if(data.prizeAmount >= 0){
                if(tCoin >= this.betValue){
                    this.tCoin.text = tCoin - this.betValue;
                    this.gameScore.text = gameScore + data.prizeAmount;
                }else{
                    this.gameScore.text = gameScore - this.betValue + data.prizeAmount;
                }
            }
        }
        enter () {
            this.enterAni.play(0, false);
            this.menu.enter();
        }
    }
    Sail.class(Header, "Com.Game.Header");
}