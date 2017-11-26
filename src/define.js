/**
 * Primus
 */
// var IO_CONFIG = {
//     type : "primus",
//     URL : connectionUrl,
//     publicKey : publicKey,
//     token : token
// };
/**
 * Socket.IO
 */
// var IO_CONFIG = {
//     type : "socket",
//     URL : connectionUrl,
//     token : token,
//     // "force new connection" : true,
//     // "reconnect" : true
// };
/**
 * Ajax 如果不需要socket连接方式，则默认使用ajax，下面的配置为ajax的默认配置，一般不需要更改
 */
// var IO_CONFIG = {
//     type : "ajax",
//     timeout : 30000
// };



var GAME_CONFIG = {
    WIDTH : 1334,
    HEIGHT : 750,
    SCREEN_MODE : Laya.Stage.SCREEN_HORIZONTAL, //可选自动横屏:Laya.Stage.SCREEN_HORIZONTAL 或者 自动竖屏:Laya.Stage.SCREEN_VERTICAL
    SCALE_MODE : Laya.Stage.SCALE_FIXED_WIDTH, //自动横屏时选择:Laya.Stage.SCALE_FIXED_WIDTH  自动竖屏时选择:Laya.Stage.SCALE_FIXED_HEIGHT
    DIALOGTYPE : "multiple", //弹窗模式 single:弹出弹窗时自动关闭其他弹窗, multiple : 允许弹出多层弹窗，可使用"closeOther:true"在弹出时关闭其他弹窗
    VERSION : "20170609",
    BASE_PATH : CDN_URL
};

//自定义常量
var SOUNDSTATUS = {
    OFF : 0,
    ON : 1,
    CUR : 1
};

var USER_LOGIN_STATUS = false;
var USER_DEFAULT_INFO = null;
var GAME_CMDS = {
    USE_PROP : "/?act=game_rolldicenew&st=use_prop", //使用平安娱乐险
    QUERY_USER_INFO : "/?act=game_rolldicenew&st=query_user_account", //查询用户信息
    GET_GAME_RESULT : "/?act=game_rolldicenew&st=play", //获取游戏结果
    GET_NOTIFY : "/?act=game_rolldicenew&st=get_marguee", //公告
    GET_RANK_BET : "/?act=game_rolldicenew&st=get_bet_rank", //日月周排行榜
    GET_RANK_PRIZE : "/?act=game_rolldicenew&st=get_prize_list", //中奖排行
    GET_RANK_MINE : "/?act=game_rolldicenew&st=my_prize_list", //我的中奖
    GET_RANK_RICH : "/?act=game_rolldicenew&st=rich_list", //富豪榜
    PLAY : "game.result",
    NO_LOGIN : "game.nologin",
    NET_ERROR : "xhr.neterror",
    RANK_NO_DATA : "rank.nodata",
    RANK_RICH_NODATA : "rank.richnodata",
    GAME_RESET : "game.reset",
    GAME_BET_VALUE : "game.set_bet_value",
    EMIT_PLAY_DATA : "game.emit_play_data",
};