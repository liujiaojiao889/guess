{
    class PreLoadPro extends Laya.Box {
        constructor () {
            super();
            
            this.proBG = null;
            this.proBar = null;

            this.init();
        }
        destroy  () {
            super.destroy.call(this, true);
            this.proBG = null;
            this.proBar = null;
        }
        init () {
            this.size(830, 10);
            this.centerX = 0;
            this.bottom = 50;
            
            let proBG = new Laya.Image("res/start/preload_pro_bg.png");
                proBG.sizeGrid = "5,6,5,6";
                proBG.size(this.width, this.height);

            let proBar = new Laya.Image("res/start/preload_pro_bar.png");
                proBar.sizeGrid = "5,6,5,6";
                proBar.size(0, this.height);

            this.proBG = proBG;
            this.proBar = proBar;
            this.addChildren(proBG, proBar);
        }
        load (res, callback) {
            Laya.loader.load(res, Laya.Handler.create(this, function () {
                callback();
            }, [callback]), new Laya.Handler(this, function (value  ) {
                this.proBar.width = this.width * value;
            }));
        }
    }
    
    Sail.class(PreLoadPro, "Com.Start.PreLoad");
}