describe('index.entry.js',function(){
    beforeEach(function(){
        var f = jasmine.getFixtures();
        f.fixturesPath = '/base/test/fixtures'
        f.load('index.html');
    })
    it('lib should export to global',function(){
        expect(ReactDOM).toEqual(jasmine.any(Object));
        expect(React).toEqual(jasmine.any(Object));
    })
    it('react-dom render a div',function(){
        expect($('div#test-dom').length).toBe(1)
    })

    it('img src',function(){
        var src = $('#touxiang').attr('src')
        expect(src.indexOf('/dist/fake_demo/img/touxiang')).toBe(0);
    })
})