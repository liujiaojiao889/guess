{
    let EVENT_COMPLETE = Laya.Event.COMPLETE;
    let totalTime = 1000;
    let speed = 50;
    let Inited = false;

    class ResultPanel extends ui.Game.ResultCoinUI {
        constructor () {
            super();

            this.prizeScore = 0;
            this.diff = 0;
            this.startCount = 0;

            this.init();
        }
        init () {
            this.centerX = 0;
            this.y = 90;
            this.visible = false;

            let ACTIONS = {
                [GAME_CMDS.PLAY] : this.enter,
                [GAME_CMDS.GAME_RESET] : this.exit
            };
            Sail.io.register(ACTIONS, this);

            this.enterAni.on(EVENT_COMPLETE, this, this.winScoreAni);
        }
        winScoreAni () {
            if(this.prizeScore != 0){
                this.startCount = 0;
                this.diff = this.prizeScore / totalTime * speed | 0;
                this.loop();
            }
        }
        loop () {
            this.startCount += this.diff;

            if(this.startCount >= this.prizeScore){
                this.startCount = this.prizeScore;
            }else{
                Laya.timer.once(speed, this, this.loop);
            }

            this.winScore.text = ":" + this.startCount;
        }
        enter (data) {
            this.prizeScore = data.prizeAmount;
            this.winScore.text = ":0";

            Laya.timer.once(1500, this, function () {
                if(this.prizeScore >= 0){
                    if(!Inited){
                        this.visible = true;
                        Inited = true;
                    }
                    this.enterAni.play(0, false);
                }
            });
        }
        exit () {
            Laya.timer.clearAll(this);
            this.winScore.text = `:${this.prizeScore}`;
            this.exitAni.play(0, false);
        }
    }
    Sail.class(ResultPanel, "Com.Game.ResultPanel");
}