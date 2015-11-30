var path = require('path');
var WebpackCoc = require ('../lib/index.js')
var del = require('del')
var fs = require('fs')
var should  = require('should')



var cocMgr = new WebpackCoc({
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

var production = cocMgr.defaultConfig.production,
    development = cocMgr.defaultConfig.development;

development.resolve = production.resolve={
    alias:{
        k1: 'v1',
        k2: 'v2',
        react:'v3'
    }
}


del.sync(['dist/*'],{force:true})
var prodConfig = cocMgr.buildProduction();
var devConfig = cocMgr.buildDevelopment();

describe('config',function(){
    it('user defined config should over default',function(){
        var resolve = prodConfig.resolve;
        console.log(resolve)
        resolve.alias['k1'].should.be.exactly('v1')
        resolve.alias['k2'].should.be.exactly('v2')
        resolve.alias['react'].should.be.exactly('v3')
        resolve.alias['react-dom'].should.be.true
    })
})
