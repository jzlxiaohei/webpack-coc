import path from 'path'
import fs from 'fs'
import glob from 'glob'
import clone from 'clone'
import objHash from 'object-hash';

import webpack from 'webpack'

console.log('env:'+process.env.NODE_ENV)

function isArray(arr){
    return Object.prototype.toString.call( arr ) === '[object Array]'
}

if(process.env.NODE_ENV !== 'production'){
    var WebpackDevServer =require('webpack-dev-server')
}

import AssetsPlugin from 'assets-webpack-plugin-zl'
import objectAssign from 'object-assign';
var UglifyJS = require("uglify-js");

import replaceHolder from './utils/replaceHolder'
import mergeTo from './utils/mergeTo'

import production from './defaultConfig/production/config'
import development from './defaultConfig/development/confg'
var mkdirp = require('mkdirp');

//path 以/开头,不以/结尾
const basicOptions={
    project_name:false,
    src_path:true,
    dist_path:true,
    node_module_path:true,
    map_json_filename:false,//webpack-assets.json
    map_json_path:false,
    libs:false,//default []
    dev_port:false,// 9527,
    cdn_path:false,//''
    provide_vars:false,
    uglify_lib_options:false,//{compress:false},
    entryExts:false,//['js']
    devServerHost:false
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
        this.options = objectAssign({},options);
        this.options.dev_port = this.options.dev_port || 9527;
        this.options.libs = this.options.libs||[];
        this.options.cdn_path = this.options.cdn_path ||'';
        this.options.entryExts = this.options.entryExts || ['js']
        this.options.uglify_lib_options = objectAssign({compress:false},this.options.uglify_lib_options);
        this.options.devServerHost = this.options.devServerHost || "localhost"
        this.holders={}
        for(var i in this.options){
            let val = this.options[i]
            this.holders[`[${i}]`] = `${val}`;
        }
        this.init();
        this.defaultConfig={
            production:clone(production),
            //productionLib:clone(productionLib),
            development:clone(development)
        }
        this.finalConfig={
            production:null,
            development:null
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
                processAssets:(assets)=>{
                    let mergedAssets=objectAssign({},this.libAssets,assets)
                    let newAssets = {}
                    for(let i in mergedAssets){
                        newAssets[this.options['project_name']+'/'+i] = mergedAssets[i];
                    }
                    return newAssets
                }
            })

        this.libsObj=null
        this.libAssets =null;
        this._initLib()
    }

    _initLib(){
        const libs = this.options.libs;
        if(libs.length===0){ return; }

        const LibMap = WebpackCoc.LibMap;
        this.alias={}
        this.noParse=[]
        this.externals={}
        this.libsObj={}
        for(let i =0;i<libs.length;i++) {
            let lib = libs[i]
            if (! (lib in LibMap) ) {
                throw new Error(`cannot find ${lib} in WebpackCoc.LibMap,make sure you config the item properly`)
            }
            let libConfig = LibMap[lib];
            this.alias[lib] = libConfig.alias || libConfig.path
            this.noParse.push(libConfig.noParse || libConfig.path)
            this.externals[lib] = libConfig.externals
            this.libsObj[lib] = libConfig.path;
        }
        this.libsObj = this._replaceHolder(this.libsObj);
    }

    _replaceHolder(obj){
        return replaceHolder(this.holders,obj)
    }



    _buildLib(){
        const libsObj = this.libsObj
        if(!libsObj){
            return;
        }

        const vals = Object.keys(libsObj).map(function (key) {
            return libsObj[key];
        });
        var result = UglifyJS.minify(vals,this.options.uglify_lib_options)

        var libDistPath = this._replaceHolder('[dist_path]/[project_name]/')

        mkdirp.sync(libDistPath);

        fs.writeFileSync(libDistPath+'lib.js',result.code);

        const libHash = objHash(this.libsObj);

        const options = this.options;

        this.libAssets = {
            'lib':{
                js:`${options.cdn_path}/${options.project_name}/lib.js?v=${libHash}`
            }
        }
    }

    buildProduction(folder){
        this.entries=this._makeEntry(folder);

        let originConfig = clone(this.defaultConfig.production)
        mergeTo(originConfig.resolve.alias,this.alias)
        mergeTo(originConfig.module.noParse ,this.noParse)
        mergeTo(originConfig.externals,this.externals);
        mergeTo(originConfig.entry, this.entries)
        if(this.noParse){
            originConfig.module.noParse = originConfig.module.noParse.concat(this.noParse)
        }

        var options = this.options

        if(options.map_json_path) {
            originConfig.plugins.push(this.__assetsPluginInstance)
        }
        if(options.provide_vars){
            originConfig.plugins.push(
                new webpack.ProvidePlugin(options.provide_vars)
            )
        }
        this.finalConfig.production = this._replaceHolder(originConfig)
        return this.finalConfig.production
    }


    buildDevelopment(folder){
        if(process.env.NODE_ENV === 'production'){
            throw new Error('buildDevelop should not be called in production env');
        }

        this.entries=this._makeEntry(folder);
        this.devEntries = this._makeDevEntry();

        let originConfig = clone(this.defaultConfig.development)
        mergeTo(originConfig.resolve.alias ,this.alias)
        mergeTo(originConfig.externals , this.externals)
        mergeTo(originConfig.entry , this.devEntries)
        if(this.noParse){
            originConfig.module.noParse = originConfig.module.noParse.concat(this.noParse)
        }

        this.finalConfig.development = this._replaceHolder(originConfig)
        return this.finalConfig.development
    }

    runProduction(buildLib=true){
        var prodConfig = this.finalConfig.production;
        if(!prodConfig){
            throw new Error('you should call buildProduction method before')
        }

        if(buildLib){
            this._buildLib()
        }

        webpack(prodConfig,this.defaultErrorHandler)

    }

    runDevelopment(options={},buildLib=true){
        var devConfig = this.finalConfig.development
        if(!devConfig){
            throw new Error('you should call buildDevelopment method before')
        }
        if(buildLib){
            this._buildLib()
        }
        var serverOptions = objectAssign({
            //hot: true,
            publicPath:devConfig.output.publicPath || 'http://localhost:'+this.options.dev_port,
            stats:{
                colors:true
            }
        },options)
        var server = new WebpackDevServer(webpack(devConfig),serverOptions)
        server.listen(this.options.dev_port,this.options.devServerHost)
    }

    _makeEntry(folders){
        folders = folders || '**'
        if(!isArray(folders)){
            folders = [folders]
        }
        var entries = {};
        const srcPath = this.options['src_path'];
        const project_name = this.options['project_name']

        let entryFiles = []
        for(let i in this.options.entryExts){
            let ext = this.options.entryExts[i];
            for(let j in folders){
                var folder = folders[j];
                let pathPattern = path.join(srcPath ,`./${folder}/*.entry.${ext}`)
                console.log(pathPattern)
                entryFiles = entryFiles.concat(glob.sync(pathPattern));
            }
        }

        console.log('entryFiles: '+entryFiles)

        if(entryFiles.length==0){
            throw new Error(`no file match ${pathPattern}`)
        }
        for (let i = 0; i < entryFiles.length; i++) {
            var filePath = entryFiles[i];
            var key = path.relative(srcPath,filePath);
            key = key.substring(0,key.lastIndexOf('.'))
            entries[key] = entryFiles[i];
        }
        return entries;
    }

    _makeDevEntry(){
        let entries = this.entries
        let devEntries = {}
        for(let i in entries) {
            devEntries[i] = [
                'webpack-dev-server/client?http://0.0.0.0:' + this.options.dev_port,
                //'webpack/hot/dev-server',
                entries[i]
            ]
        }
        return devEntries;
    }


    defaultErrorHandler(err,stats){
        if(err){
            throw err;
        }
        var jsonStats = stats.toJson();
        var errors = jsonStats.errors
        if(errors.length > 0){
            console.log(`${errors.length} error(s), first one is:`)
            throw new Error(errors[0]);
        }
        console.log(stats.toString({
            colors: true,
            children: false,
            chunks: false,
            modules: false
        }))
    }
}
WebpackCoc.webpack =  webpack;
WebpackCoc.WebpackDevServer = WebpackDevServer;

WebpackCoc.LibMap = {
    jquery:{
        path:'[node_module_path]/jquery/dist/jquery.min.js',
        //noParse:'[node_module_path]/jquery/dist/jquery.min.js',
        externals:'jQuery'
    },
    react:{
        path:'[node_module_path]/react/dist/react.min.js',
        //noParse:'[node_module_path]/react/dist/react.min.js',
        externals:'React'
    },
    'react-dom':{
        path:"[node_module_path]/react-dom/dist/react-dom.min.js",
        //noParse:"[node_module_path]/react-dom/dist/react-dom.min.js",
        externals:'ReactDOM'
        /* 完整的写法,上面的写法是直接expose 到window的写法
         root:'ReactDOM',
         commonjs2: 'react-dom',
         commonjs: 'react-dom',
         amd:'react-dom'
         */
    }
}