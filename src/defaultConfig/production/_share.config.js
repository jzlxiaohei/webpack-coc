var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require('webpack')
var path = require('path')

var autoprefixer = require('autoprefixer');
var precss      = require('precss');

module.exports = {
    entry: {
    },
    output: {
        filename: "[name]-[chunkhash].js",
        chunkFilename:'[name]-[chunkhash].js',
        path: '[dist_path]/[project_name]',
        libraryTarget:'umd',
        publicPath:'/[project_name]'
    },
    //devtool: 'eval',
    externals:{

    },

    resolve:{
        //alias:{}
    },
    module: {
        //noParse:[],
        loaders: [
            {
                test: /[\.jsx|\.js ]$/,
                exclude: /node_modules/,
                loader: "babel-loader?stage=0&optional[]=runtime"
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!postcss-loader!less-loader')
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'file-loader?name=/img/[name]-[hash].[ext]'
            }
        ]
    },
    devtool:'sourcemap',
    plugins: [
        new ExtractTextPlugin("[name]-[chunkhash].css"),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ],
    postcss: function () {
        return [autoprefixer, precss];
    }
}