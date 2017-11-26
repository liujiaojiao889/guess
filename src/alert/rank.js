{
    let EVENT_CLICK = Laya.Event.CLICK;
    let EVENT_STOP  = Laya.Event.STOPPED;
    let utils = Sail.Utils;
    let RANK_LOADING = null;
    let RANK_CONFIG = [
        {cmd : GAME_CMDS.GET_RANK_BET, selectedIndex : 0, param : {"type" : "day"}},
        {cmd : GAME_CMDS.GET_RANK_BET, selectedIndex : 0, param : {"type" : "week"}},
        {cmd : GAME_CMDS.GET_RANK_BET, selectedIndex : 0, param : {"type" : "month"}},
        {cmd : GAME_CMDS.GET_RANK_PRIZE, selectedIndex : 1, param : null},
        {cmd : GAME_CMDS.GET_RANK_MINE, selectedIndex : 2, param : null}
    ];
    let RESULT_TEXT = {
        "大" : "高能量",
        "小" : "低能量",
        "豹子" : "超能量",
    };

    class Rank extends ui.Alert.RankUI {
        constructor () {
            super();

            this.enableClick = true;
            this.curIndex = -1;
            this.ACTIONS = null;

            this.init();
        }

        init () {
            if(!RANK_LOADING){
                RANK_LOADING = utils.createSkeleton("res/alert/rank/loading");
                RANK_LOADING.pos(300, 250);
            }
            this.rankTab.selectHandler = new Laya.Handler(this, this.onTabSelected);
            this.rankList.renderHandler = new Laya.Handler(this, this.onRankListRender);
            this.rankMineLogin.on(EVENT_CLICK, this, function () {
                location.href = GM.userLoginUrl;
            });

            this.ACTIONS = {
                [GAME_CMDS.GET_RANK_BET] : this.updateRank,
                [GAME_CMDS.GET_RANK_PRIZE] : this.updateRank,
                [GAME_CMDS.GET_RANK_MINE] : this.updateRank,
                [GAME_CMDS.NO_LOGIN] : this.updateRank,
                [GAME_CMDS.NET_ERROR] : this.netError,
                [GAME_CMDS.RANK_NO_DATA] : this.updateRank,
                [GAME_CMDS.RANK_RICH_NODATA] : this.updateRich,
                [GAME_CMDS.GET_RANK_RICH] : this.updateRich
            };

            Sail.io.register(this.ACTIONS, this);

            RANK_LOADING.play(0, true);
            this.contentWrap.addChild(RANK_LOADING);

            this.rankTab.selectedIndex = 0;
            this.richList.array = [];
            Sail.io.emit(GAME_CMDS.GET_RANK_RICH, null, "ajax");
        }

        onTabSelected (index) {
            if(!this.enableClick){
                this.rankTab.selectedIndex = this.curIndex;
                return;
            }
            this.enableClick = false;
            this.rankNodata.visible = false;
            this.curIndex = index;
            this.rankList.array = [];
            this.rankPrize.array = [];
            this.rankMine.array = [];

            this.rankCon.selectedIndex = RANK_CONFIG[index].selectedIndex;
            RANK_LOADING.visible = true;
            RANK_LOADING.play(0, true);
            Sail.io.emit(RANK_CONFIG[index].cmd, RANK_CONFIG[index].param, "ajax");
        }
        netError (data, cmd) {
            for(let i in this.ACTIONS){
                if(i == cmd){
                    this.enableClick = true;
                    return;
                }
            }
        }
        updateRich (data) {
            let richData = data.list;
            if(richData && richData.length > 0){
                for(let i in richData){
                    richData[i].userName = richData[i].disName;
                    richData[i].rank = richData[i].rank - 1;
                    richData[i].coin = richData[i].prize_amount;
                }
                this.richList.visible = true;
                this.richList.array = richData;
            }else{
                this.richNodata.visible = true;
            }
        }
        updateRank (data, cmd){
            switch(cmd){
                case GAME_CMDS.GET_RANK_BET:
                    let rankData = data.list || [];
                    for(let i in rankData){
                        rankData[i].userName = rankData[i].nickname;
                        rankData[i].trendIcon = 3 - rankData[i].rank_trend;
                        rankData[i].rankIcon = rankData[i].rank - 1;
                        rankData[i].coin = rankData[i].amount | 0;
                    }
                    this.rankList.array = rankData;
                    if(rankData.length == 0){
                        this.rankNodata.visible = true;
                    }
                    break;
                case GAME_CMDS.GET_RANK_PRIZE:
                    let betData = data.list || [];
                    for(let i in betData){
                        betData[i].userName = betData[i].disName;
                        betData[i].coin = betData[i].prize_amount;
                        betData[i].result = RESULT_TEXT[betData[i].result];
                    }
                    this.rankPrize.array = betData;
                    if(betData.length == 0){
                        this.rankNodata.visible = true;
                    }
                    break;
                case GAME_CMDS.GET_RANK_MINE:
                    if(data == "nologin"){
                        this.rankMineLogin.visible = true;
                        this.rankMine.visible = false;
                    }else{
                        let myData = data.list || [];
                        for(let i in myData){
                            myData[i].coin = myData[i].prize_amount;
                            myData[i].time = myData[i].raw_add_time;
                            myData[i].result = RESULT_TEXT[myData[i].result];
                        }
                        this.rankMine.array = myData;
                        this.rankMineLogin.visible = false;
                        this.rankMine.visible = true;
                        if(myData.length == 0){
                            this.rankNodata.visible = true;
                        }
                    }
                    break;
            }
            RANK_LOADING.visible = false;
            RANK_LOADING.stop();
            this.enableClick = true;
        }
        onRankListRender (item, index) {
            let rankIcon = item.getChildByName("rankIcon");
            if(index < 3){
                rankIcon.visible = true;
            }else{
                rankIcon.visible = false;
            }
        }

        onClosed () {
            Sail.io.unregister(this.ACTIONS);
            this.ACTIONS = null;

            RANK_LOADING.stop();
            RANK_LOADING.removeSelf();
        }
    }
    Sail.class(Rank, "Alert.Rank");
}