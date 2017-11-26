;(function () {
	var utils = Sail.Utils;

	var IOPrimus = (function () {
		var IO_DATA = {
			_commKey : null,		//res加密公钥所用到的key
			token : null,			//玩家token，在连接初始化时用于res生成公钥
			jwtToken : null,		//res加密之后的玩家token，数据交互以此token为主
			publicKey : null,		//res公钥
			URL : null,	//连接url
			encryptedString : null,	//res加密后的验证字符串
		};
		var cmd = {
			CONN_INIT : "conn::init",			//连接初始化，用来更新jwt token
			CONN_ERROR : "conn::error",			//服务端异常

			TEST_PING : "test::ping",			//测试用命令
			TEST_PONG : "test::pong",			//测试用命令

			APIACTIVITY : "api::activity"		//不中险
		};

		function IOPrimus(config, callback) {
			this.primus = null;
			this.callback = callback;
			this.isOpened = false;//连接是否已经初始化过

			this.init(config);
		}
		var _proto = IOPrimus.prototype;

		_proto.init = function(config){
			utils.extend(true, IO_DATA, config);

			this.generateCommKey();
			this.generateEncryptedString();

			try{
				this.connect();
			}catch(e){
				console.error(e);
			}
		}
		//生成commkey
		_proto.generateCommKey = function(){
			try{
				//默认32位编码
				IO_DATA._commKey = Date.now().toString() + Date.now().toString() + Date.now().toString().substring(0,6);
			}catch(e){
				console.log("初始化commKey失败",e);
			}
		}
		//生成encryptedString
		_proto.generateEncryptedString = function(){
			try{
				var params = "jwt=" + IO_DATA.token + "&commKey=" + IO_DATA._commKey;
				var jsencrypt = new JSEncrypt();
				jsencrypt.setPublicKey(IO_DATA.publicKey);
				IO_DATA.encryptedString = jsencrypt.encrypt(params);
			}catch(e){
				console.log("初始化encryptedString失败", e);
			}
		}
		_proto.onOpen = function(){
			//防止reconnect之后重复触发open，以下事件只绑定一次
			if(this.isOpened){ return; }
			this.isOpened = true;
			//触发open
			this.callback("io.open");

			this.primus.on('data', this.onData.bind(this));
			this.primus.on('error', function (data) { this.callback("io.error", data); }.bind(this));
			this.primus.on('reconnect', function () { this.callback("io.reconnect"); }.bind(this));
			this.primus.on('end', function () { this.callback("io.close"); }.bind(this));
		}
		_proto.onData = function(data){
			//解密
			var decryptstr = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(IO_DATA._commKey), {
				mode: CryptoJS.mode.ECB,
				padding: CryptoJS.pad.Pkcs7
			});

			var dataString = decryptstr.toString(CryptoJS.enc.Utf8);
			var parsedData = JSON.parse(dataString);

			//更新jwt token
			if(parsedData.cmd == cmd.CONN_INIT){
				IO_DATA.jwtToken = parsedData.res;
			}

			this.callback(parsedData.cmd, parsedData.res || parsedData.rep, parsedData.code, parsedData.error || parsedData.msg);
		}
		_proto.connect = function () {
			this.primus = Primus.connect(IO_DATA.URL);

			this.primus.on('outgoing::url', function(url){
				url.query = 'login=' + IO_DATA.encryptedString;
				console.log("outgoing::url", url.query);
			});

			this.primus.on('open', this.onOpen.bind(this));
		}

		_proto.emit = function(cmd, params){
			//为data增加token
			var DATA_TEMPLATE = {
				"cmd" : cmd,
				"params" : {
					"jwt" : IO_DATA.jwtToken,
				},
				"status" : {
					"time" : Date.now()
				}
			};
			
			utils.extend(true, DATA_TEMPLATE, {params : params});

			var data = JSON.stringify(DATA_TEMPLATE);

			console.log("<---发送命令：" + cmd + ", 时间:" + Date.now() + ", 命令类型：Primus\n数据：" + data);

			//加密
			var encryptData = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(IO_DATA._commKey), {
				mode: CryptoJS.mode.ECB,
				padding: CryptoJS.pad.Pkcs7
			});
			//发送加密数据
			this.primus.write(encryptData.toString());
		}
		//手动断开连接
		_proto.end = function(){
			this.primus && this.primus.end();
		}

		return IOPrimus;
	})();

	var IOSocket = (function () {
		var token = null;
		var DEFAULT_CONFIG = {
			"force new connection" : true
		};

		var cmd = {
			APIACTIVITY : "api::activity"		//不中险
		};

		function IOSocket(config, callback) {
			this.socket = null;
			this.callback = callback;
			this.isOpened = false;//连接是否已经初始化过

			this.init(config);
		}
		var _proto = IOSocket.prototype;

		_proto.init = function (config) {
			token = config.token;
			utils.extend(true, DEFAULT_CONFIG, config);
			
			try{
				this.connect();
			}catch(e){
				console.error(e);
			}
		}
		_proto.connect = function () {
			this.socket = io.connect(DEFAULT_CONFIG.URL, DEFAULT_CONFIG);

			this.socket.on("router", this.onData.bind(this));
			this.socket.on("connect", function(){ this.callback("io.open"); }.bind(this));
			this.socket.on('connect_error', function (data) { this.callback("io.error", data); }.bind(this));
			this.socket.on('reconnecting', function() { this.callback("io.reconnect"); }.bind(this));
			this.socket.on('disconnect', function() { this.callback("io.close"); }.bind(this));
		}
		_proto.onData = function (data) {
			var parsedData = JSON.parse(Base64.decode(data));

			this.callback(parsedData.cmd, parsedData.res || parsedData.rep, parsedData.code, parsedData.error || parsedData.msg);
		}

		_proto.emit = function (cmd, params) {
			var DATA_TEMPLATE = {
				"cmd" : cmd,
				"params" : {
					"token" : token,
				},
				"status" : {
					"time" : Date.now()
				}
			};
			
			utils.extend(true, DATA_TEMPLATE, {params : params});

			var data = JSON.stringify(DATA_TEMPLATE);

			console.log("<---发送命令：" + cmd + ", 时间:" + Date.now() + ", 命令类型：Socket\n数据：" + data);
			this.socket.emit("router", Base64.encode(data));
		}
		_proto.end = function () {
			this.socket.close();
			this.socket.removeAllListeners();
		}
	})();


	(function () {
		var ACTIONS = {
			"conn::init" : function () {console.log("成功初始化连接");},
			"io.error" : function (data) {console.log("连接出错");},
			"io.reconnect" : function () {console.log("重连中");},
			"io.close" : function () {console.log("连接已关闭");},
			"io.open" : function () {console.log("连接成功");}
		};
		var DEFAULT_CONFIG = {
			"type" : "ajax",
			"timeout" : 300000
		}

		function IO() {
			IO.super(this);

			this.type = null;
			this.socket = null;
			this.errorPlugin = null;
			this.isOpened = false;//连接是否已经初始化过

			this.register(ACTIONS, this);
		}
		Laya.class(IO, "Sail.IO", Sail.Viewer);
		var _proto = IO.prototype;

		_proto.dispatch = function (cmd, data, code, errormsg, type) {
			if(this.errorPlugin){
				var isError = this.errorPlugin.checkError(cmd, data, code, errormsg, type);

				//error
				if(isError){
					return;
				}
			}

			if(cmd == GAME_CMDS.GET_GAME_RESULT){
				setTimeout(function() {
					this.publish(cmd, data, cmd);
				}.bind(this), 0);
				return;
			}
			this.publish(cmd, data, cmd);
		}

		_proto.ajax = function (cmd, type, url, data) {
			data = data ? data : {};
			if(type){
				type = type.toUpperCase();
				type = type === "POST" || type === "GET" ? type : "GET";
			}else{
				type = "GET";
			}

			console.log("<---发送命令：" + cmd + ", 时间:" + Date.now() + ", 命令类型：Ajax-" + type + "\n数据：" + JSON.stringify(data));

			$.ajax({
				type     : type,
				url      : url || cmd,
				dataType : 'json',
				data     : data,
				timeout  : DEFAULT_CONFIG.timeout,
				success  : function (cmd, data) {
					console.log("命令：" + cmd + "\n接收到Ajax数据--->\n" + JSON.stringify(data));
					switch(cmd){
						case GAME_CMDS.QUERY_USER_INFO:
							data = {"wltScore":0,"TScore":"14520","TCoin":0,"tingdou":19500,"caijin":5400,"caifen":7095,"jiankangjin":0,"jiankangjin_origin":0,"jiankangjin_fee":20,"jkj_tp_rate":500,"gameScore":66515,"total":46515,"wltTotalScore":"","wanlitong_handling_fee":0,"user_name":"Jan2014","statusCode":"0000","message":"success"};
							break;
						case GAME_CMDS.GET_GAME_RESULT:
							if(Math.random() < 0.1){
								data = {"statusCode":"losepointalarm","message":"losepointalarm","losepointlevel":"level3","losepointvalue":""}
							}else{
								data = {"statusCode":"0000","message":"success","type":"large","value":[((Math.random() * 6 | 0) + 1).toString(),((Math.random() * 6 | 0) + 1).toString(),((Math.random() * 6 | 0) + 1).toString()]};
								data.prizeAmount = Math.random() > 0.5 ? Math.random() * 99999 | 0 : 0;
								(data.prizeAmount == 0 && Math.random() > 0.5) && (data.payback = {"code":"PROPS_PB_6d469cd3415cfe5855290f058657ce5c","paybackPoint":50});
							}

							// {"statusCode":"losepointalarm","message":"losepointalarm","losepointlevel":"level3","losepointvalue":""}万里通输分提醒
							// data = {"gciId":4196718,"prizeAmount":1000,"value":["1","4","5"],"statusCode":"0000","message":"success","type":"small"};赢
							// data = {"gciId":4196726,"payback":{"code":"PROPS_PB_6d469cd3415cfe5855290f058657ce5c","paybackPoint":50},"prizeAmount":0,"value":["1","5","1"],"statusCode":"0000","message":"success","type":"large"} //输，是否使用平安娱乐险
							break;
						case GAME_CMDS.USE_PROP:
							data = {"code":"PROPS_PB_6d469cd3415cfe5855290f058657ce5c","paybackPoint":50,"statusCode":"0000","message":"success"};
							break;
						case GAME_CMDS.GET_NOTIFY:
							data = {"statusCode":"0000","message":"success","list":[{"rank":0,"disName":"开开开心心心","prize_amount":2700},{"disName":"59***32","prize_amount":2484,"type":"payback"},{"disName":"59***32","prize_amount":97,"type":"payback"},{"disName":"ststs","prize_amount":49,"type":"payback"},{"disName":"ststs","prize_amount":100,"type":"payback"},{"disName":"ststs","prize_amount":199,"type":"payback"},{"disName":"18181818","prize_amount":51,"type":"payback"},{"disName":"欧生记","prize_amount":299,"type":"payback"},{"disName":"欧生记","prize_amount":499,"type":"payback"},{"disName":"ststs","prize_amount":96,"type":"payback"},{"disName":"ststs","prize_amount":99,"type":"payback"}]};
							break;
						case GAME_CMDS.GET_RANK_BET:
							data = {"statusCode":"1000","list":[{"rank":1,"userid":46751078,"amount":"419000.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"\u6b27\u751f\u8bb0"},{"rank":2,"userid":75083146,"amount":"278500.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"75****46"},{"rank":3,"userid":15762339,"amount":"173600.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3"},{"rank":4,"userid":20351145,"amount":"164800.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"20****45"},{"rank":5,"userid":218146,"amount":"146500.0000","rank_trend":1,"gameid":917,"period":1,"nickname":"ststs"},{"rank":6,"userid":77824714,"amount":"90200.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"77****14"},{"rank":7,"userid":2430204,"amount":"65000.0000","rank_trend":1,"gameid":917,"period":1,"nickname":"haohaohao"},{"rank":8,"userid":12068728,"amount":"38100.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"\u8d62\u54e5"},{"rank":9,"userid":777314,"amount":"36000.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"\u81ea\u7531\u7ff1\u7fd4"},{"rank":10,"userid":68029942,"amount":"30800.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"68****42"},{"rank":11,"userid":77561714,"amount":"17900.0000","rank_trend":1,"gameid":917,"period":1,"nickname":"77****14"},{"rank":12,"userid":393230,"amount":"12400.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"\u82b1\u6837\u7f8e\u7537"},{"rank":13,"userid":15067889,"amount":"9800.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"wenkezong"},{"rank":14,"userid":157266,"amount":"8500.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"\u5f88\u9e1f"},{"rank":15,"userid":209690,"amount":"8200.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"\u8096\u6728"},{"rank":16,"userid":14329515,"amount":"7600.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"just1978"},{"rank":16,"userid":2820038,"amount":"7600.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"28***38"},{"rank":17,"userid":16876404,"amount":"7500.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"16****04"},{"rank":18,"userid":34459189,"amount":"6800.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"520191"},{"rank":19,"userid":23668542,"amount":"6600.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"\u897f6"},{"rank":20,"userid":38357044,"amount":"6300.0000","rank_trend":1,"gameid":917,"period":1,"nickname":"38357044"},{"rank":21,"userid":31040771,"amount":"6100.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"88491"},{"rank":22,"userid":25944823,"amount":"5000.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"dre5"},{"rank":23,"userid":29389318,"amount":"4400.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"jhgg1"},{"rank":24,"userid":23711800,"amount":"4300.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"\u68116"},{"rank":25,"userid":71087222,"amount":"4100.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"13883502792"},{"rank":26,"userid":25954363,"amount":"3900.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"hhh6"},{"rank":27,"userid":63895284,"amount":"3700.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"\u5929\u4e0b\u4e00"},{"rank":28,"userid":78120810,"amount":"3600.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"78****10"},{"rank":29,"userid":23667100,"amount":"3500.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"\u57066"},{"rank":29,"userid":8164824,"amount":"3500.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"\u5218\u6676\u4f1f"},{"rank":29,"userid":78120998,"amount":"3500.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"78****98"},{"rank":30,"userid":28801240,"amount":"3300.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"gfd10"},{"rank":31,"userid":78121824,"amount":"3200.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"78****24"},{"rank":31,"userid":78121822,"amount":"3200.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"78****22"},{"rank":31,"userid":31183387,"amount":"3200.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"9621"},{"rank":32,"userid":78121302,"amount":"3100.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"78****02"},{"rank":33,"userid":78121624,"amount":"3000.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"78****24"},{"rank":33,"userid":24058672,"amount":"3000.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"\u5e736"},{"rank":33,"userid":77350274,"amount":"3000.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"77****74"},{"rank":33,"userid":30989159,"amount":"3000.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"6336"},{"rank":33,"userid":29375422,"amount":"3000.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"hgff2"},{"rank":33,"userid":30564,"amount":"3000.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"30*64"},{"rank":33,"userid":27933754,"amount":"3000.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"aaaa9"},{"rank":33,"userid":23668028,"amount":"3000.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"\u547c6"},{"rank":34,"userid":30989497,"amount":"2900.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"63366"},{"rank":35,"userid":25954121,"amount":"2800.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"rt65"},{"rank":35,"userid":160100,"amount":"2800.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"\u5f20\u51a0\u6770"},{"rank":36,"userid":25768757,"amount":"2700.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"jhy3"},{"rank":37,"userid":78121628,"amount":"2600.0000","rank_trend":3,"gameid":917,"period":1,"nickname":"78****28"}]};
							break;
						case GAME_CMDS.GET_RANK_PRIZE:
							data = {"statusCode":"0000","message":"success","list":[{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":900,"result":"\u8c79\u5b50"},{"disName":"\u8096\u6728","prize_amount":1800,"result":"\u8c79\u5b50"},{"disName":"\u8096\u6728","prize_amount":1800,"result":"\u8c79\u5b50"},{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":4500,"result":"\u8c79\u5b50"},{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":4500,"result":"\u8c79\u5b50"},{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":2700,"result":"\u8c79\u5b50"},{"disName":"\u71d5\u59d0","prize_amount":900,"result":"\u8c79\u5b50"},{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":2700,"result":"\u8c79\u5b50"},{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":2700,"result":"\u8c79\u5b50"},{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":2700,"result":"\u8c79\u5b50"},{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":900,"result":"\u8c79\u5b50"},{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":2700,"result":"\u8c79\u5b50"},{"disName":"\u8096\u6728","prize_amount":1800,"result":"\u8c79\u5b50"},{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":4500,"result":"\u8c79\u5b50"},{"disName":"\u71d5\u59d0","prize_amount":900,"result":"\u8c79\u5b50"},{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":4500,"result":"\u8c79\u5b50"},{"disName":"\u4e56\u4e56\u8fd8\u6709\u54e5\u54e5","prize_amount":900,"result":"\u8c79\u5b50"},{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":4500,"result":"\u8c79\u5b50"},{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":1800,"result":"\u8c79\u5b50"},{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":4500,"result":"\u8c79\u5b50"},{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":4500,"result":"\u8c79\u5b50"},{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":900,"result":"\u8c79\u5b50"},{"disName":"\u8096\u6728","prize_amount":900,"result":"\u8c79\u5b50"},{"disName":"\u4e56\u4e56\u8fd8\u6709\u54e5\u54e5","prize_amount":900,"result":"\u8c79\u5b50"},{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":2700,"result":"\u8c79\u5b50"},{"disName":"\u5f00\u5f00\u5f00\u5fc3\u5fc3\u5fc3","prize_amount":900,"result":"\u8c79\u5b50"},{"disName":"\u71d5\u59d0","prize_amount":900,"result":"\u8c79\u5b50"},{"disName":"\u81ea\u7531\u7ff1\u7fd4","prize_amount":3600,"result":"\u8c79\u5b50"},{"disName":"\u4e56\u4e56\u8fd8\u6709\u54e5\u54e5","prize_amount":900,"result":"\u8c79\u5b50"},{"disName":"\u8096\u6728","prize_amount":900,"result":"\u8c79\u5b50"}]};
							break;
						case GAME_CMDS.GET_RANK_MINE:
							data = {"statusCode":"0000","message":"success","list":[{"prize_amount":200,"raw_add_time":"2017-06-18 17:36:40","result":"\u5927"},{"prize_amount":1000,"raw_add_time":"2017-06-18 17:20:35","result":"\u5c0f"},{"prize_amount":200,"raw_add_time":"2017-06-17 11:50:57","result":"\u5c0f"},{"prize_amount":200,"raw_add_time":"2017-06-17 11:50:38","result":"\u5c0f"}]};
							break;
						case GAME_CMDS.GET_RANK_RICH:
							data = {"statusCode":"0000","message":"success","list":[{"prize_amount":1227400,"disName":"ststs","rank":1},{"prize_amount":1023200,"disName":"\u6765\u81ea\u706b\u661f","rank":2},{"prize_amount":700000,"disName":"haohaohao","rank":3}]};
							break;
					}
					this.dispatch(cmd, data, null, null, "ajax");
				}.bind(this, cmd),
				error	 : function(e){
					console.log("命令：" + cmd + "\nAjax异常--->\n" + JSON.stringify(e));
					this.dispatch("xhr.error",cmd, null, e,"ajax");
				}.bind(this)
			});
		}
		_proto.ajaxPost = function (cmd, url, data) {
			this.ajax(cmd, "POST", url, data);
		}
		_proto.ajaxGet = function (cmd, url, data) {
			this.ajax(cmd, "GET", url, data);
		}
		_proto.emit = function (cmd, params, ioType, ajaxType) {
			if(ioType === "ajax"){
				this.ajax(cmd, ajaxType, cmd, params);
			}else{
				if(!this.socket){
					console.error("没有可用的Socket连接");
					return;
				}
				this.socket.emit(cmd, params);
			}
		}
		_proto.end = function () {
			this.socket.end();
		}
		_proto.init = function (config, errorPlugin) {
			DEFAULT_CONFIG = utils.extend({}, DEFAULT_CONFIG, config);
			var type = DEFAULT_CONFIG.type;
			this.type = (type === "primus" || type === "socket" || type === "ajax") ? type : null;

			switch(this.type){
				case "socket":
					this.socket = new IOSocket(DEFAULT_CONFIG, this.dispatch.bind(this));
					break;
				case "primus":
					this.socket = new IOPrimus(DEFAULT_CONFIG, this.dispatch.bind(this));
					break;
				case "ajax":
					break;
				default:
					console.error("需要指定IO的类型为socket|primus");
			}

			if(typeof errorPlugin != "undefined"){
				this.errorPlugin = new errorPlugin;
			}
		}
	})();
})();