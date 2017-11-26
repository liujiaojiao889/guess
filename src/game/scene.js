{
    let EVENT_STOP = Laya.Event.STOPPED;
    let utils = Sail.Utils;

    let ACTIONS = {
        [GAME_CMDS.EMIT_PLAY_DATA] (type) {
            let msg = this.checkBetVal(this.betValue);
            if(msg.length > 0){
                Sail.io.publish(GAME_CMDS.GAME_RESET, true);
                Sail.director.popScene(new Alert.Public({msg : `<span style="color:#64cee5">${msg}</span>`}));
                return;
            }
            let params = {
                type : type,
                amount : this.betValue
            };

            this.lastGetGameResTime = Date.now();
            Sail.io.emit(GAME_CMDS.GET_GAME_RESULT, params, "ajax");
        },
        [GAME_CMDS.GAME_BET_VALUE] (value) {
            this.betValue = value;
        },
        [GAME_CMDS.GAME_RESET] () {
            Laya.SoundManager.stopAllSound();
        },
        [GAME_CMDS.USE_PROP] (data) {
            Sail.director.popScene(new Alert.Public({msg : `<span style="color:#64cee5">平安娱乐险成功为您避免了</span><span style="color:#ffd632">${data.paybackPoint}</span><span style="color:#64cee5">损失</span>`}));
        },
        [GAME_CMDS.QUERY_USER_INFO] (data) {
            USER_LOGIN_STATUS = true;
            USER_DEFAULT_INFO = null;
        },
        [GAME_CMDS.GET_GAME_RESULT] (data) {
            if(data.prizeAmount >= 0 && data.value.length > 0){
                let delay = Date.now() - this.lastGetGameResTime > 3000 ? 0 : 3000;

                Laya.timer.once(delay, this, function (result) {

                    Sail.io.publish(GAME_CMDS.PLAY, result);
                    Laya.timer.once(result.prizeAmount > 0 ? 3400 : 2000, this, function (result) {
                        Sail.director.popScene(new Alert.Result(result));
                    }, [result]);

                }, [data]);
            }else{
                Sail.io.publish(GAME_CMDS.GAME_RESET, true);
                Sail.director.popScene(new Alert.Public({msg : '<span style="color:#64cee5">网络异常，请稍后再试！</span>'}));
            }
        }
    };

    class GameScene extends Sail.Scene {
        constructor () {
            super();

            this.BGImg = null;
            this.BGAni = null;
            this.betCtrl = null;
            this.playCtrl = null;
            this.resultCtrl = null;
            this.resultPanel = null;
            this.header = null;
            this.notify = null;
            this.logo = null;
            this.lastGetGameResTime = 0;

            this.betValue = 0;

            this.init();
        }
        init () {
            Laya.SoundManager.playMusic("sound/background.mp3");

            this.size(Laya.stage.width, Laya.stage.height);
            Sail.io.register(ACTIONS, this);
            
            let BGImg = new Laya.Image("res/game/bg/game_bg.jpg");
                BGImg.anchorX = 0.5;
                BGImg.anchorY = 0.5;
                BGImg.pos(Laya.stage.width / 2, Laya.stage.height / 2);

            let BGAni = utils.createSkeleton("res/game/bg/bg_ani");
                BGAni.pos(BGImg.width / 2, BGImg.height / 2);
                BGAni.play(0, true);
            BGImg.addChild(BGAni);
            
            this.betCtrl = new Com.Game.BetCtrl();
            this.playCtrl = new Com.Game.PlayCtrl();
            this.resultCtrl = new Com.Game.ResultCtrl();
            this.resultPanel = new Com.Game.ResultPanel();
            this.header = new Com.Game.Header();
            this.notify = new Com.Game.Notify();
            let logo = utils.createSkeleton("res/game/head/logo");
                logo.x = this.width / 2;
                logo.once(EVENT_STOP, this, function () {
                    this.logo.play("loop", true);
                    let iconBet = new Laya.Image("res/start/icon_beta.png");
                        iconBet.alpha = 0;
                        iconBet.size(73, 39);
                        iconBet.pos(778, 4);
                    
                    Laya.Tween.to(iconBet, {alpha : 1}, 500);
                    this.addChild(iconBet);
                });

            this.logo = logo;
            this.BGImg = BGImg;
            this.BGAni = BGAni;
            this.addChildren(BGImg, this.resultCtrl, this.betCtrl, this.playCtrl, this.notify, this.resultPanel, this.header, this.logo);

            if(USER_DEFAULT_INFO){
                Sail.io.publish(GAME_CMDS.QUERY_USER_INFO, USER_DEFAULT_INFO);
            }else{
                Sail.io.emit(GAME_CMDS.QUERY_USER_INFO, null, "ajax");
            }
        }
        checkBetVal (_val) {
            var tipBetStr = '';
            if (!/^\d*$/.test(_val)) {
                tipBetStr = '投币金额必须是正整数';
            } else if (_val == 0) {
                tipBetStr = '还木有投币，赶快投币再来点我吧！';
            } else if (_val < 100) {
                tipBetStr = '最小投币额为100';
            } else if (_val <= 10000) {
                if (_val % 100 !== 0) {
                    tipBetStr = '投币额在100-10000之间,请输入100的整数倍';
                }
            } else if (_val <= 100000) {
                if (_val % 5000 !== 0) {
                    tipBetStr = '投币额在10000-100000之间,请输入5000的整数倍';
                }
            } else if (_val <= 500000) {
                if (_val % 10000 !== 0) {
                    tipBetStr = '投币额在100000-500000之间,请输入10000的整数倍';
                }
            } else if (_val > 500000) {
                tipBetStr = '最大投币额为500000';
            }
            return tipBetStr;
        }

        onEnter () {
            Laya.Tween.from(this.BGImg, {scaleX : 1.5, scaleY : 1.5, alpha : 0}, 300);
            this.header.enter();
            this.betCtrl.enter();
            this.playCtrl.enter();
            this.resultCtrl.enter();
            this.notify.enter();
            Laya.timer.once(920, this, function () {
                this.logo.play("enter", false);
            });
        }
        onResize (width, height) {
            this.size(width, height);
            this.BGImg.y = height / 2;
        }
    }

    Sail.class(GameScene, "Scene.Game");
}