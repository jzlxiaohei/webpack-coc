'use strict';

var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: {
        lib: '[src_path]/lib/lib.js'
    },
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: '/dist',
        libraryTarget: 'umd',
        sourceMapFilename: '[name].map',
        //library:'libName',
        publicPath: 'http://localhost:[dev_port]/[project_name]'
    },
    resolve: {},
    externals: {},
    module: {
        loaders: [{
            test: /[\.jsx|\.js ]$/,
            exclude: /node_modules/,
            loaders: ['babel-loader?stage=0&optional[]=runtime']
        }, { test: /\.css$/, loader: 'style!css' }, {
            test: /\.less$/,
            loader: 'style-loader!css-loader!less-loader'
        }, { test: /\.(png|jpg|gif)$/, loader: 'url-loader' }]
    },
    debug: true,
    devtool: 'source-map',
    plugins: [new webpack.HotModuleReplacementPlugin()]
};