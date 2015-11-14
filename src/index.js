import path from 'path'
import fs from 'fs'
import glob from 'glob'
import clone from 'clone'
import AssetsPlugin from 'assets-webpack-plugin'
import webpack from 'webpack'
var objectAssign = require('object-assign');

import replaceHolder from './utils/replaceHolder'

import productionNormal from './defaultConfig/production/normal.config'
import productionLib from './defaultConfig/production/lib.config'
import development from './defaultConfig/development/confg'


const basicOptions={
    project_name:false,
    src_path:true,
    dist_path:true,
    node_module_path:true,
    map_json_filename:false,
    map_json_path:true,
    libs:false,//default []
    dev_port:false// 9527
}

function checkOptions(options){
    for(let i in basicOptions){
        if(basicOptions[i] && !(i in options)){
            throw new Error(`option : ${i} is required`)
        }
    }
}


export default class WebpackCoc{

    constructor(options){
        checkOptions(options)
        options.dev_port = options.dev_port || 9527;
        this.options = options;
        this.holders={}
        for(var i in options){
            let val = options[i]
            this.holders[`[${i}]`] = `${val}`;
        }
        this.init();
        this.defaultConfig={
            productionNormal,
            productionLib,
            development
        }
    }

    init(){
        const options = this.options;
        this.__assetsPluginInstance = new AssetsPlugin(
            {
                filename:options.map_json_filename || 'webpack-assets.json',
                path:options.map_json_path,
                update: true,
                prettyPrint: true,
                fullPath:false
            })
        this.entries=this.makeEntry();

        this.devEntries = this.makeDevEntry();
        this.__initLib()

    }

    __initLib(){
        const libs = this.options.libs || [];
        const LibMap = WebpackCoc.LibMap;
        this.alias={}
        this.noParse=[]
        this.externals={}
        for(let i =0;i<libs.length;i++) {
            let lib = libs[i]
            if (! (lib in LibMap) ) {
                throw new Error(`cannot find ${lib} in WebpackCoc.LibMap,make sure you config the item properly`)
            }
            let libConfig = LibMap[lib];
            this.alias[lib] = libConfig.alias
            this.noParse.push(libConfig.noParse || libConfig.alias)
            this.externals[lib] = libConfig.externals
        }
    }

    getProductionNormal(){
        let originConfig = clone(this.defaultConfig.productionNormal)
        originConfig.plugins.push(this.__assetsPluginInstance)
        originConfig.entry = this.entries
        originConfig.resolve.alias = this.alias
        originConfig.module.noParse = this.noParse
        originConfig.externals = this.externals;
        if(this.options.save_config){

        }
        return replaceHolder(this.holders,originConfig)
    }

    getProductionLib(){
        let originConfig = clone(this.defaultConfig.productionLib);
        originConfig.plugins.push(this.__assetsPluginInstance)
        originConfig.resolve.alias = this.alias
        originConfig.module.noParse = this.noParse
        return replaceHolder(this.holders,originConfig)

    }

    getDevelopment(){
        let originConfig = clone(this.defaultConfig.development)
        objectAssign(originConfig.entry, this.devEntries)
        originConfig.resolve.alias = this.alias
        originConfig.module.noParse = this.noParse
        return replaceHolder(this.holders,originConfig);
    }

    runProduction(){
        webpack(this.getProductionLib(),this.defaultErrorHandler)
        webpack(this.getProductionNormal(),this.defaultErrorHandler)
    }

    runDevelopment(){
        var devConfig = this.getDevelopment();
        var server = new WebpackDevServer(webpack(devConfig),{
            hot: true,
            publicPath:devConfig.output.publicPath || 'http://localhost:'+this.options.dev_port,
            stats:{
                colors:true
            }
        })
        server.listen(this.options.dev_port,'localhost')
    }

    makeEntry(){
        var entries = {};
        const srcPath = this.options['src_path'];
        var entryFiles = glob.sync(path.join(srcPath ,'./**/*.entry.js'));
        for (var i = 0; i < entryFiles.length; i++) {
            var filePath = entryFiles[i];
            var key = path.relative(srcPath,filePath);
            key = key.substring(0,key.lastIndexOf('.'))
            entries[key] = entryFiles[i];
        }
        return entries;
    }

    makeDevEntry(){
        let entries = this.entries
        let devEntries = {}
        for(let i in entries) {
            devEntries[i] = [
                'webpack-dev-server/client?http://0.0.0.0:' + this.options.dev_port,
                'webpack/hot/dev-server',
                entries[i]
            ]
        }
        return devEntries;
    }


    defaultErrorHandler(err,stats){
        if(err){
            throw new err;
        }
        var jsonStats = stats.toJson();
        var errors = jsonStats.errors
        if(errors.length > 0){
            console.log(`${errors.length} error(s), first one is:`)
            throw new Error(errors[0]);
        }
    }
}

WebpackCoc.LibMap = {
    jquery:{
        alias:'[node_module_path]/jquery/dist/jquery.min.js',
        noParse:'[node_module_path]/jquery/dist/jquery.min.js',
        externals:'jQuery'
    },
    react:{
        alias:'[node_module_path]/react/dist/react.min.js',
        noParse:'[node_module_path]/react/dist/react.min.js',
        externals:'React'
    },
    'react-dom':{
        alias:"[node_module_path]/react-dom/dist/react-dom.min.js",
        noParse:"[node_module_path]/react-dom/dist/react-dom.min.js",
        externals:'ReactDOM'
        /* 完整的写法,上面的写法是直接expose 到window的写法
         root:'ReactDOM',
         commonjs2: 'react-dom',
         commonjs: 'react-dom',
         amd:'react-dom'
         */
    }
}