{
    let EVENT_CLICK = Laya.Event.CLICK;
    let EVENT_COMPLETE = Laya.Event.COMPLETE;

    class Menu extends ui.Game.MenuUI {
        constructor () {
            super();

            this.showFlag = false;
            this.isAnimation = false;

            this.init();
        }

        init () {
            this.anchorX = 0.5;
            this.anchorY = 0.5;
            this.alpha = 0;
            this.pos(1205, 48);
            this.scale(1.5, 1.5);

            this.enterAni.on(EVENT_COMPLETE, this, this.setFlag);
            this.exitAni.on(EVENT_COMPLETE, this, this.setFlag);

            this.btnMenu.on(EVENT_CLICK, this, this.switchOpen);
            this.bg.on(EVENT_CLICK, this, this.switchOpen);
            
            this.btnFaq.on(EVENT_CLICK, this, function () {
                if(this.isAnimation){return;}

                Laya.SoundManager.playSound("sound/btn.mp3");
                Sail.director.popScene(new Alert.Faq);
                this.switchOpen();
            });
            this.btnSound.on(EVENT_CLICK, this, function () {
                if(this.isAnimation){return;}

                Laya.SoundManager.playSound("sound/btn.mp3");
                this.btnSound.setVoiceStatus();
                this.switchOpen();
            });

            Laya.stage.on(EVENT_CLICK, Laya.stage, function (menu) {
                if(menu.showFlag){
                    if(!menu.bg.hitTestPoint(this.mouseX, this.mouseY)){
                        menu.switchOpen();
                    }
                }
            }, [this]);
        }

        switchOpen () {
            if(this.isAnimation){return;}

            if(this.showFlag){
                this.exitAni.play(0, false);
            }else{
                Laya.SoundManager.playSound("sound/btn.mp3");
                this.enterAni.play(0, false);
            }
            this.isAnimation = true;
        }
        setFlag () {
            this.showFlag = !this.showFlag;
            this.isAnimation = false;
        }
        enter () {
            Laya.Tween.to(this, {scaleX : 1, scaleY : 1, alpha : 1}, 160, null, null, 800);
        }
    }
    Sail.class(Menu, "Com.Game.Menu");
}