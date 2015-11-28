
module.exports = function(config) {
    config.set({
        basePath: './',
        frameworks: ['jasmine'],
        files:[
            'test/test_lib/jquery.js',
            'test/test_lib/jasmine-jquery.js',
            'test/dist/fake_demo/lib.js',
            'test/dist/fake_demo/common.js',
            'test/dist/fake_demo/index/index.entry.js',
            'test/**/*.spec.js',
            'test/fixtures/*.html'
        ],
        // web server port
        port: 9876,

        reporters: ['progress'],

        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['Chrome'],//['Chrome','Safari'],
        singleRun:true
    });
};