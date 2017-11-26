{
    let utils = Sail.Utils;
    let EVENT_CLICK = Laya.Event.CLICK;
    let EVENT_STOP  = Laya.Event.STOPPED;
    let BLOCK_CONFIG = {
        "1" : [[66, 62]],
        "2" : [[51, 37], [81, 88]],
        "3" : [[36, 12], [66, 63], [95, 113]],
        "4" : [[21, 38], [81, 38], [50, 88], [110, 88]],
        "5" : [[35, 12], [95, 12], [66, 62], [35, 113], [95, 113]],
        "6" : [[21, 13], [81, 13], [52, 63], [110, 63], [21, 113], [81, 113]]
    };

    let ResultBlock = (() => {
        let Pool = [];
        class ResultBlock extends Laya.Box {
            constructor (pos) {
                super();
                this.blockAni = null;

                this.init();
                this.reset(pos);
            }
            init () {
                this.size(58, 65);
                let blockAni = utils.createSkeleton("res/game/result/block");
                    blockAni.pos(this.width / 2, this.height / 2);

                this.blockAni = blockAni;
                this.addChild(blockAni);
            }

            reset (pos) {
                this.alpha = 0;
                this.pos(pos[0], pos[1] + 200);
                this.blockAni.play("loop", true);

                Laya.Tween.to(this, {y : pos[1], alpha : 1}, 300, Laya.Ease.backOut, null, Math.random() * 100 | 0);

                return this;
            }
            recover () {
                this.blockAni.stop();

                Laya.Tween.to(this, {y : this.y + 200, alpha : 0}, 300, Laya.Ease.backIn, Laya.Handler.create(this, function () {
                    this.removeSelf();
                    Pool.push(this);
                }), Math.random() * 100 | 0);
            }
        }
        ResultBlock.create = function (pos) {
            if(Pool.length !== 0){
                console.log("create from pool");
                return Pool.pop().reset(pos);
            }else{
                console.log("create from constructor");
                return new ResultBlock(pos);
            }
        }
        return ResultBlock;
    })();

    class ResultScreen extends Laya.Box {
        constructor () {
            super();
            this.screenAni = null;
            this.screenValue = null;

            this.init();
        }
        init () {
            this.size(90, 90);
            this.pos(160, 269);
            let screenAni = utils.createSkeleton("res/game/result/screen");
                screenAni.pos(this.width / 2, this.height / 2);
                screenAni.on(EVENT_STOP, screenAni, function () {
                    if(this.status != "exit"){
                        this.play("loop", true);
                    }
                });

            let screenValue = new Laya.Label();
                screenValue.align = "center";
                screenValue.font = "font_power";
                screenValue.size(this.width, 66);
                screenValue.pivot(screenValue.width / 2, screenValue.height / 2);
                screenValue.pos(this.width / 2, this.height / 2);
                screenValue.scale(3, 3);
                screenValue.alpha = 0;

            this.screenAni = screenAni;
            this.screenValue = screenValue;
            this.addChildren(screenAni, screenValue);
        }
        enter (value) {
            this.screenValue.text = value;

            Laya.timer.once(800, this, function () {
                Laya.Tween.to(this.screenValue, {scaleX : 1, scaleY : 1, alpha : 1}, 300, Laya.Ease.backOut, null, 700);
                
                this.screenAni.status = "enter";
                this.screenAni.play("enter", false);
            });
        }
        exit (){
            Laya.Tween.to(this.screenValue, {scaleX : 3, scaleY : 3, alpha : 0}, 420, Laya.Ease.backOut, null, 420);
            this.screenAni.status = "exit";
            this.screenAni.play("exit", false);
        }
    }

    class ResultUI extends Laya.Box {
        constructor (index) {
            super();

            this.blockArea = null;
            this.energyAni = null;
            this.energyArea = null;
            this.screenArea = null;
            this.loopIndex = 0;
            this.blockLists = [];
            this.delay = 100;

            this.init(index);
        }
        init (index) {
            this.size(410, 430);
            this.index = index;
            this.centerX = 410 * (index - 1);
            if(this.index === 1){this.delay = 0;}

            let blockArea = new Laya.Box();
                blockArea.size(190, 190);
                blockArea.centerX = 0;
                blockArea.y = 52;
            
            let energyArea = new Laya.Box();
                energyArea.size(this.width, 135);
                energyArea.pivot(energyArea.width / 2, 100);
                energyArea.pos(energyArea.width / 2 + 134 * (index - 1), 389);
                energyArea.alpha = 0;
                energyArea.scale(1.2, 1.2);

            let energyAni = utils.createSkeleton("res/game/result/pool");
                energyAni.pos(energyArea.width / 2, energyArea.height);
                energyAni.curAniName = "enter";
                energyAni.play("enter", false);
                energyAni.on(EVENT_STOP, this, function () {
                    switch(this.energyAni.curAniName){
                        case "enter":
                            this.energyAni.curAniName = "waiting";
                            this.energyAni.play("waiting", true);
                            break;
                        case "lottery_drawing":
                            this.energyAni.curAniName = "lottery_result";
                            this.energyAni.play("lottery_result", true);
                            break;
                    }
                });
                energyAni.paused();
                energyAni.index = 0;
            energyArea.addChild(energyAni);

            this.screenArea = new ResultScreen();
            this.blockArea = blockArea;
            this.energyAni = energyAni;
            this.energyArea = energyArea;
            this.addChildren(blockArea, energyArea, this.screenArea);
        }
        enter (position) {
            Laya.Tween.to(this.energyArea, {scaleX : 1, scaleY : 1, alpha : 1, x : this.energyArea.width / 2}, 370, null, Laya.Handler.create(this, function () {
                Laya.timer.once(this.delay, this, function () {
                    this.energyAni.resume();
                });
            }), this.delay);
        }
        play () {
            Laya.timer.once(this.delay, this, function () {
                this.energyAni.curAniName = "lottery_waiting";
                this.energyAni.play("lottery_waiting", true);
            });
        }
        draw (value) {
            Laya.timer.once(this.delay, this, function () {
                this.energyAni.curAniName = "lottery_drawing";
                this.energyAni.play("lottery_drawing", false);
            });
            Laya.timer.once(900, this, function () {
                var config = BLOCK_CONFIG[value];
                for(var i in config){
                    var block = ResultBlock.create(config[i]);
                    this.blockArea.addChild(block);
                    this.blockLists.push(block);
                }
            });

            this.screenArea.enter(value);
        }
        reset (force) {
            Laya.timer.clearAll(this);

            for(var i in this.blockLists){
                this.blockLists[i].recover();
            }
            this.blockLists.length = 0;
            !force && this.screenArea.exit();
            this.energyAni.curAniName = "waiting";
            this.energyAni.play("waiting", true);
        }
    }
    
    class ResultCtrl extends Laya.Box {
        constructor () {
            super();

            this.uiLists = [];

            this.init();
        }

        init () {
            this.size(1334, 430);
            this.centerY = 0;

            let ACTIONS = {
                [GAME_CMDS.EMIT_PLAY_DATA] : this.play,
                [GAME_CMDS.GAME_RESET] : this.reset,
                [GAME_CMDS.NET_ERROR] : this.netError,
                [GAME_CMDS.PLAY] : this.draw
            }
            Sail.io.register(ACTIONS, this);

            for(var i = 0; i < 3; i++){
                let resultUI = new ResultUI(i);

                this.uiLists.push(resultUI);
                this.addChild(resultUI);
            }
        }

        netError (data, cmd) {
            if(cmd == GAME_CMDS.GET_GAME_RESULT){
                this.reset(true);
            }
        }
        /**
         * 开始摇奖
         */
        play () {
            for(let i in this.uiLists){
                this.uiLists[i].play();
            }
            Laya.SoundManager.playSound("sound/game_start.mp3", 1, Laya.Handler.create(this, function () {
                Laya.SoundManager.playSound("sound/game_wait.mp3", 0);
            }));
        }
        /**
         * 开奖
         */
        draw (data) {
            let value = data.value;
            if(value && value.length == this.uiLists.length){
                for(let i in this.uiLists){
                    this.uiLists[i].draw(value[i]);
                }
            }
            Laya.SoundManager.stopSound("sound/game_wait.mp3");
            Laya.SoundManager.playSound("sound/game_result.mp3");
        }
        /**
         * 开奖结束，复原动画
         */
        reset (force) {
            for(let i in this.uiLists){
                this.uiLists[i].reset(force);
            }
        }
        /**
         * 入场动画
         */
        enter () {
            Laya.timer.once(210, this, function () {
                for(let i in this.uiLists){
                    this.uiLists[i].enter();
                }
            });
        }
    }
    Sail.class(ResultCtrl, "Com.Game.ResultCtrl");
}