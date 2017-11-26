{
    let utils = Sail.Utils;

    class MainLoadPro extends Laya.Box {
        constructor () {
            super();

            this.proBG = null;
            this.proBar = null;
            this.star = null;

            this.init();
        }
        destroy () {
            super.destroy.call(this, true);
            this.proBG = null;
            this.proBar = null;
            this.rate = null;
            this.star = null;
        }
        init () {
            this.size(920, 20);
            this.centerX = 0;
            this.bottom = 110;

            let proBG = new Laya.Image("res/start/start_pro_bg.png");
                proBG.sizeGrid = "10,15,10,15";
                proBG.size(this.width + 2, this.height + 2);
                proBG.pos(-1, -1);

            let proBar = new Laya.Image("res/start/start_pro_bar.png");
                proBar.sizeGrid = "9,15,9,15";
                proBar.size(0, this.height);

            let star = utils.createSkeleton("res/start/star");
                star.visible = false;
                star.pos(0, 10);
                star.play(0, true);

            this.proBG = proBG;
            this.proBar = proBar;
            this.star = star;
            this.addChildren(proBG, proBar, star);
        }
        onProgress (value) {
            this.proBar.width = this.width * value;
            this.star.x = this.proBar.width;
        }
        load (res, callback) {
            this.star.visible = true;
            Laya.loader.load(res, Laya.Handler.create(this, function () {
                callback();
            }, [callback]), new Laya.Handler(this, this.onProgress));
        }
    }
    Laya.class(MainLoadPro, "Com.Start.MainLoad");
}