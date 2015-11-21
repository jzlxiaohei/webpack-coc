var path = require('path');
var fs = require('fs')
var should  = require('should')

describe('run production',function(){

    it('files exist',function(){
        fs.statSync(path.join(__dirname,'dist/webpack-assets.json'))
        fs.statSync(path.join(__dirname,'dist/fake_demo/common.js'))
        fs.statSync(path.join(__dirname,'dist/fake_demo/lib.js'))
        fs.statSync(path.join(__dirname,'dist/fake_demo/index/index.entry.js'))
        fs.statSync(path.join(__dirname,'dist/fake_demo/index/index.entry.css'))
    })

    it('lib should return react',function(){
        var React =require(path.join(__dirname,'dist/fake_demo/lib.js'))
        React.Component.should.be.type('function')
    })

    it('index.entry',function(){
        //fake window obj .. wtf
        global.window=global

        require(path.join(__dirname,'dist/fake_demo/common.js'));

        var retObj =require(path.join(__dirname,'dist/fake_demo/index/index.entry.js'));

        (retObj.React === undefined).should.be.true
    })

    it('img path',function(){
        var cssContent = fs.readFileSync(path.join(__dirname,'./dist/fake_demo/index/index.entry.css'));
        var cssContent = cssContent.toString();

        (cssContent.indexOf('/dist/fake_demo/img/touxiang')!== -1).should.be.true
    })

    it('assets map',function(){
        var assetsJson   = fs.readFileSync(path.join(__dirname,'./dist/webpack-assets.json'));
        var obj = JSON.parse(assetsJson);
        (obj['fake_demo/lib']['js'].indexOf('/dist/fake_demo/lib.js') !== -1).should.be.true
    })
})