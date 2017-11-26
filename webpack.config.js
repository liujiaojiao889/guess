var UglifyJsPlugin = require("webpack/lib/optimize/UglifyJsPlugin");
// var webpack = require("webpack");

var entry = [
	"./src/alert/result.js",
	"./src/alert/rank.js",
	"./src/alert/public.js",
	"./src/alert/insurance.js",
	"./src/alert/recharge.js",
	"./src/alert/faq.js",

	"./src/header/btnsound.js",
	"./src/header/menu.js",
	"./src/header/notify.js",
	"./src/header/head.js",

	"./src/start/com/mainloadpro.js",
	"./src/start/com/preloadpro.js",
	"./src/start/scene.js",

	"./src/game/com/bet.js",
	"./src/game/com/play.js",
	"./src/game/com/resultarea.js",
	"./src/game/com/resultcoin.js",
	"./src/game/scene.js",
];
    
module.exports = {
    entry: entry,
    output: {
        path: __dirname + "/bin",
        filename: "main.min.js"
    },
    module: {
        loaders: [
            {
                test: /\.json$/,
                loader: "json"
            },
            {
                test: /\.js$/,
                // exclude: /node_modules/,
                loader: 'babel-loader',//在webpack的module部分的loaders里进行配置即可
                query: {
                    presets: ['latest']
                }
            }
        ]
    },
    plugins: [
        new UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};