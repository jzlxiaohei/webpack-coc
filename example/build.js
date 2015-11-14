import path from 'path'
import webpack from 'webpack'
import  WebpackDevServer from "webpack-dev-server";

import ConfigMgr from '../src/WebpackConfigManager'

var configMgr = new  ConfigMgr({
    project_name:'static/dist/webpack-coc',
    src_path:path.join(__dirname , './assets/src'),
    dist_path:path.join(__dirname, './assets/dist'),
    node_module_path:path.join(__dirname,'../node_modules'),
    map_json_filename:'./assets/assets-map.json',
    map_json_path:__dirname,
    libs:['react','react-dom','jquery']
})

//production

webpack(configMgr.getProductionNormal(),configMgr.defaultErrorHandler)
webpack(configMgr.getProductionLib(),configMgr.defaultErrorHandler)

//var devConfig = configMgr.getDevelopment();
//var server = new WebpackDevServer(webpack(devConfig),{
//    hot: true,
//    publicPath:devConfig.output.publicPath || 'http://localhost:'+configMgr.options.dev_port,
//    stats:{
//        colors:true
//    }
//})
//server.listen(configMgr.options.dev_port,'localhost')