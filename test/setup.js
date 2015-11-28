var path = require('path');
var CocMgr = require ('../src/index.js')
var del = require('del')
var fs = require('fs')
var should  = require('should')

var cocMgr = new CocMgr({
    project_name:'fake_demo',
    src_path:path.join(__dirname,'fake_demo'),
    dist_path:path.join(__dirname,'dist'),
    node_module_path:path.join(__dirname,'../node_modules'),
    map_json_path:path.join(__dirname,"dist"),
    libs:['react','react-dom'],
    cdn_path:'/dist',
    provide_vars:{
        React:'react',
        ReactDOM:'react-dom'
    }
})
//console.log(cocMgr.getProductionNormal())


var webpack = require('webpack')

del.sync(['dist/*'],{force:true})
cocMgr.buildProduction();
cocMgr.runProduction();