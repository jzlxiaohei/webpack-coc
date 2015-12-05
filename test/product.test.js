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
        fs.statSync(path.join(__dirname,'dist/fake_demo/ts.entry.js'))
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