{
    let utils = Sail.Utils;
    
    class StartScene extends Sail.Scene {
        constructor () {
            super();
            
            this.proPreLoad = null;
            this.proMainLoad = null;
            this.BGStaticImg = null;
            this.iconBet = null;
            this.BGMain = null;
            this.BGAni = null;
            this.notice = null;

            this.size(Laya.stage.width, Laya.stage.height);
        }
        init () {
            this.size(Laya.stage.width, Laya.stage.height);
            
            Sail.io.register(GAME_CMDS.QUERY_USER_INFO, this, this.checkLogin);
            Sail.io.emit(GAME_CMDS.QUERY_USER_INFO, null, "ajax");

            this.showStaticProgress();
            this.proPreLoad.load(ASSETS.START, this.showMainView.bind(this));
        }
        showStaticProgress () {
            let BGMain = new Laya.Image("res/start/start_bg.jpg");
                BGMain.centerY = 0;
                
            let BGStaticImg = new Laya.Image("res/start/preload_img.png");
                BGStaticImg.centerX = 0;
                BGStaticImg.centerY = 0;

            let iconBet = new Laya.Image("res/start/icon_beta.png");
                iconBet.x = 600;
                iconBet.centerY = -285;
                iconBet.zOrder = 10;
            BGMain.addChild(iconBet);

            let proPreLoad = new Com.Start.PreLoad();

            this.BGMain = BGMain;
            this.iconBet = iconBet;
            this.BGStaticImg = BGStaticImg;
            this.proPreLoad = proPreLoad;
            this.addChildren(BGMain, BGStaticImg, proPreLoad);
        }
        showMainView () {
            this.BGStaticImg.removeSelf();
            this.proPreLoad.removeSelf();

            let BGAni = utils.createSkeleton("res/start/start_ani");
                BGAni.pos(this.BGMain.width / 2, this.BGMain.height / 2);
                BGAni.play(0, true);

            let notice = new Laya.Image("res/start/notice.png");
                notice.centerX = 0;
                notice.bottom = 20;
            
            let proMainLoad = new Com.Start.MainLoad();

            this.BGAni = BGAni;
            this.notice = notice;
            this.proMainLoad = proMainLoad;

            this.BGMain.addChild(BGAni);
            this.addChildren(notice, proMainLoad);

            proMainLoad.load(ASSETS.GAME, function () {
                Sail.director.runScene(new Scene.Game);
            });
        }
        checkLogin (data, cmd) {
            console.log(data, cmd);
            USER_LOGIN_STATUS = true;
            USER_DEFAULT_INFO = data;
        }

        onEnter () {
            Laya.loader.load(ASSETS.PRELOAD, Laya.Handler.create(this, this.init));
        }
        onExit () {
            this.destroy(true);

            this.proPreLoad = null;
            this.proMainLoad = null;
            this.BGStaticImg = null;
            this.iconBet = null;
            this.BGMain = null;
            this.BGAni = null;
            this.notice = null;

            Sail.io.unregister(GAME_CMDS.QUERY_USER_INFO, this.checkLogin);
        }
        onResize (width, height) {
            this.height = height;
        }
    }

    Sail.class(StartScene, "Scene.Start");
}