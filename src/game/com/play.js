{
    let EVENT_CLICK = Laya.Event.CLICK;
    let EVENT_STOP  = Laya.Event.STOPPED;
    let utils = Sail.Utils;

    let PLAY_CONFIG = [
        {name : "small", skin : "res/game/play/btn_info_1.png"},
        {name : "same", skin : "res/game/play/btn_info_2.png"},
        {name : "large", skin : "res/game/play/btn_info_3.png"},
    ];
    let locked = false;
    
    class PlayCtrl extends ui.Game.PlayUI {
        constructor () {
            super();

            this.btnLists = [];

            this.init();
        }

        init () {
            this.right = 15;
            this.bottom = 5;

            let ACTIONS = {
                [GAME_CMDS.GAME_RESET] : this.reset,
                [GAME_CMDS.NET_ERROR] : this.netError
            };
            Sail.io.register(ACTIONS, this);
            
            for(let i in PLAY_CONFIG){
                let item = this.getChildByName(PLAY_CONFIG[i].name);

                this.btnLists.push(item);
                this.setBtnAni(item, PLAY_CONFIG[i].skin);
            }
        }
        setBtnAni (target, skinPath) {
            let ani = utils.createSkeleton("res/game/play/btn_play", null, 1);
                ani.pos(target.width / 2, target.height / 2);
                ani.setSlotSkin("btn_info", Laya.loader.getRes(skinPath));
                ani.play("loop", true);

            target.btnStatus = "loop";
            target.on(EVENT_CLICK, target, this.onClick);
            target.addChild(ani);
        }
        onClick () {
            if(!Sail.checkLogin()){return;}
            if(locked){return;}
            locked = true;
            Laya.SoundManager.playSound("sound/btn.mp3");

            let ani = this.getChildAt(0);
                ani.play("click", false);
                ani.once(EVENT_STOP, ani, function () {
                    this.play("selected", true);
                });
            
            Laya.timer.once(1000, this, function () {
                Sail.io.publish(GAME_CMDS.EMIT_PLAY_DATA, this.name);
            });
        }
        reset (data, cmd) {
            for(let i in this.btnLists){
                this.btnLists[i].getChildAt(0).play("loop", true);
            }
            locked = false;
        }
        netError (data, cmd) {
            if(cmd == GAME_CMDS.GET_GAME_RESULT){
                this.reset();
            }
        }

        enter () {
            this.enterAni.play(0, false);
        }
    }
    Sail.class(PlayCtrl, "Com.Game.PlayCtrl");
}