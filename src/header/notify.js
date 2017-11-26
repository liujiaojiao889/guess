{
    let tpl = [
        '{{if type == "dice"}}',
            '<span style="color:#98ff66">{{disName}}</span><span style="color:#ffffff">正在打杀，大家赶紧来膜拜吧。</span>',
        '{{else if type == "payback"}}',
            '<span style="color:#ff6a18">{{disName}}使用平安娱乐险,免除{{prize_amount}}损失</span>',
        '{{else}}',
            '<span style="color:#dff8ff">恭喜</span><span href="#" style="color:#98ff66">{{disName}}</span><span style="color:#dff8ff">赢得超能量，获得</span><span href="#" style="color:#ffd632">{{prize_amount}}</span><span style="color:#dff8ff">分。</span>',
        '{{/if}}',
    ].join("");

    class Notify extends ui.Game.NotifyUI {
        constructor () {
            super();

            this.notify = null;

            this.init();
        }

        init () {
            this.top = 103;
            this.left = 120;
            this.alpha = 0;

            Sail.io.register(GAME_CMDS.GET_NOTIFY, this, this.update);

            let config = {
                "width" : 380,
                "fontSize" : 20,
                "tpl" : tpl,
                "complete" : function () {
                    Sail.io.emit(GAME_CMDS.GET_NOTIFY, null, "ajax");
                }
            };

            this.notify = new Tools.Notify(config);
            this.notify.pos(40, 13);
            this.addChild(this.notify);

            Sail.io.emit(GAME_CMDS.GET_NOTIFY, null, "ajax");
        }

        update (data) {
            this.notify.add(data.list);
        }

        enter () {
            Laya.Tween.to(this, {left : 20, alpha : 1}, 250, null, null, 1080);
        }
    }
    Sail.class(Notify, "Com.Game.Notify");
}