{
    let EVENT_CLICK = Laya.Event.CLICK;
    let EVENT_STOP  = Laya.Event.STOPPED;
    let utils = Sail.Utils;
    let RESULT_ANI = {};
    let RESULT_UI = null;
    let ALERT_CONFIG = {
        "closeOnSide" : true,
        "autoClose" : 4000
    };
    
    class Result extends Laya.Dialog {
        constructor (data) {
            super();

            this.CONFIG = ALERT_CONFIG;
            this.popupEffect = null;
            this.closeEffect = null;
            this.resFlag = "lose";
            this.data = data;

            this.init(data);
        }

        init (data) {
            this.size(708, 278);
            // this.mouseEnabled = true;
            this.mouseThrough = true;
            this.on(EVENT_CLICK, this, function () {
                this.close();
            });

            var btnClose = new Laya.Button("res/alert/public/btn_alert_close.png");
                btnClose.stateNum = 1;
                btnClose.name = "close";
                btnClose.right = -30;
                btnClose.top = -30;

            if(data.prizeAmount != 0){
                this.resFlag = "win";
            }

            if(!RESULT_ANI[this.resFlag]){
                let ani = utils.createSkeleton(`res/alert/result/${this.resFlag}`);
                    ani.pos(340, 170);
                    ani.on(EVENT_STOP, ani, function () {
                        if(this.status != "exit"){
                            this.play("loop", true);
                        }
                    });
                RESULT_ANI[this.resFlag] = ani;
            }
            if(!RESULT_UI){
                RESULT_UI = new ui.Alert.ResultUI();
            }

            let value = data.value;
            RESULT_UI.blockInfo.text = value.join("、");
            RESULT_UI.blockTotal.text = (value[0] | 0) + (value[1] | 0) + (value[2] | 0);
            RESULT_UI.winScore.text = data.prizeAmount;

            this.addChildren(RESULT_ANI[this.resFlag], RESULT_UI, btnClose);
        }
        // 处理人机游戏 socket的, 包括倒霉险等
		socketExec (obj){
			if( window.GM && GM.socket_RJ ){
		         if( GM.socket_RJ.exec ){
		             GM.socket_RJ.exec(obj);
		         }
		         var getMoney = GM.socket_RJ.getMoney;
		         if( getMoney && getMoney() > 0 ){
		              Sail.io.emit(GAME_CMDS.QUERY_USER_INFO, null, "ajax"); // 重新更新 余和币
		         }
            }
		}

        onOpened () {
            Laya.SoundManager.playSound(`sound/${this.resFlag}.mp3`);
            RESULT_ANI[this.resFlag].status = "enter";
            RESULT_ANI[this.resFlag].play("enter", false, true);
            RESULT_UI[this.resFlag + "Ani"].play(0, false);
            if(this.data.payback){
                Laya.timer.once(1500, this, function () {
                    Sail.director.popScene(new Alert.Insurance(this.data.payback));
                });
            }
        }
        onClosed () {
            RESULT_ANI[this.resFlag].status = "exit";
            RESULT_ANI[this.resFlag].stop();
            RESULT_ANI[this.resFlag].removeSelf();
            RESULT_UI.removeSelf();
            Sail.io.publish(GAME_CMDS.GAME_RESET);
            this.socketExec();
            this.socketExec({type: 'buzhongxian'});
        }
    }
    Sail.class(Result, "Alert.Result");
}