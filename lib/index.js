'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _clone = require('clone');

var _clone2 = _interopRequireDefault(_clone);

var _objectHash = require('object-hash');

var _objectHash2 = _interopRequireDefault(_objectHash);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackDevServer = require('webpack-dev-server');

var _webpackDevServer2 = _interopRequireDefault(_webpackDevServer);

var _assetsWebpackPluginZl = require('assets-webpack-plugin-zl');

var _assetsWebpackPluginZl2 = _interopRequireDefault(_assetsWebpackPluginZl);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _utilsReplaceHolder = require('./utils/replaceHolder');

var _utilsReplaceHolder2 = _interopRequireDefault(_utilsReplaceHolder);

var _defaultConfigProductionConfig = require('./defaultConfig/production/config');

var _defaultConfigProductionConfig2 = _interopRequireDefault(_defaultConfigProductionConfig);

var _defaultConfigDevelopmentConfg = require('./defaultConfig/development/confg');

var _defaultConfigDevelopmentConfg2 = _interopRequireDefault(_defaultConfigDevelopmentConfg);

var UglifyJS = require('uglify-js');

var mkdirp = require('mkdirp');

//path 以/开头,不以/结尾
var basicOptions = {
    project_name: false,
    src_path: true,
    dist_path: true,
    node_module_path: true,
    map_json_filename: false,
    map_json_path: true,
    libs: false, //default []
    dev_port: false, // 9527,
    cdn_path: false };

function checkOptions(options) {
    for (var i in basicOptions) {
        if (basicOptions[i] && !(i in options)) {
            throw new Error('option : ' + i + ' is required');
        }
    }
}

var WebpackCoc = (function () {
    function WebpackCoc(options) {
        _classCallCheck(this, WebpackCoc);

        checkOptions(options);
        this.options = (0, _objectAssign2['default'])({}, options);
        this.options.dev_port = this.options.dev_port || 9527;
        this.options.libs = this.options.libs || [];
        this.cdn_path = this.options.cdn_path || '';

        this.holders = {};
        for (var i in options) {
            var val = options[i];
            this.holders['[' + i + ']'] = '' + val;
        }
        this.init();
        this.defaultConfig = {
            production: (0, _clone2['default'])(_defaultConfigProductionConfig2['default']),
            //productionLib:clone(productionLib),
            development: (0, _clone2['default'])(_defaultConfigDevelopmentConfg2['default'])
        };
        this.finalConfig = {
            production: null,
            development: null
        };
    }

    WebpackCoc.prototype.init = function init() {
        var _this = this;

        var options = this.options;
        this.__assetsPluginInstance = new _assetsWebpackPluginZl2['default']({
            filename: options.map_json_filename || 'webpack-assets.json',
            path: options.map_json_path,
            update: true,
            prettyPrint: true,
            processAssets: function processAssets(assets) {
                var mergedAssets = (0, _objectAssign2['default'])({}, _this.libAssets, assets);
                var newAssets = {};
                for (var i in mergedAssets) {
                    newAssets[_this.options['project_name'] + '/' + i] = mergedAssets[i];
                }
                return newAssets;
            }
        });
        this.entries = this._makeEntry();

        this.devEntries = this._makeDevEntry();
        this.libsObj = null;
        this.libAssets = null;
        this._initLib();
    };

    WebpackCoc.prototype._initLib = function _initLib() {
        var libs = this.options.libs;
        if (libs.length === 0) {
            return;
        }

        var LibMap = WebpackCoc.LibMap;
        this.alias = {};
        this.noParse = [];
        this.externals = {};
        this.libsObj = {};
        for (var i = 0; i < libs.length; i++) {
            var lib = libs[i];
            if (!(lib in LibMap)) {
                throw new Error('cannot find ' + lib + ' in WebpackCoc.LibMap,make sure you config the item properly');
            }
            var libConfig = LibMap[lib];
            this.alias[lib] = libConfig.alias || libConfig.path;
            this.noParse.push(libConfig.noParse || libConfig.path);
            this.externals[lib] = libConfig.externals;
            this.libsObj[lib] = libConfig.path;
        }
        this.libsObj = this._replaceHolder(this.libsObj);
    };

    WebpackCoc.prototype._replaceHolder = function _replaceHolder(obj) {
        return (0, _utilsReplaceHolder2['default'])(this.holders, obj);
    };

    WebpackCoc.prototype.buildProduction = function buildProduction() {
        var originConfig = (0, _clone2['default'])(this.defaultConfig.production);
        originConfig.plugins.push(this.__assetsPluginInstance);
        originConfig.resolve.alias = this.alias;
        originConfig.module.noParse = this.noParse;
        originConfig.externals = this.externals;

        originConfig.entry = this.entries;
        this.finalConfig.production = this._replaceHolder(originConfig);
        return this.finalConfig.production;
    };

    WebpackCoc.prototype.buildDevelopment = function buildDevelopment() {
        var originConfig = (0, _clone2['default'])(this.defaultConfig.development);
        originConfig.resolve.alias = this.alias;
        originConfig.module.noParse = this.noParse;
        originConfig.externals = this.externals;
        originConfig.entry = this.devEntries;
        this.finalConfig.development = this._replaceHolder(originConfig);
        return this.finalConfig.development;
    };

    WebpackCoc.prototype._buildLib = function _buildLib() {
        var libsObj = this.libsObj;
        if (!libsObj) {
            return;
        }

        var vals = Object.keys(libsObj).map(function (key) {
            return libsObj[key];
        });
        var result = UglifyJS.minify(vals, {
            compress: false,
            mangle: false
        });

        var libDistPath = this._replaceHolder('[dist_path]/[project_name]/');

        mkdirp.sync(libDistPath);

        _fs2['default'].writeFileSync(libDistPath + 'lib.js', result.code);

        var libHash = (0, _objectHash2['default'])(this.libsObj);

        var options = this.options;

        this.libAssets = {
            'lib': {
                js: '' + options.cdn_path + '/' + options.project_name + '/lib.js?v=' + libHash
            }
        };
    };

    WebpackCoc.prototype.runProduction = function runProduction() {
        var buildLib = arguments[0] === undefined ? true : arguments[0];

        var prodConfig = this.finalConfig.production;
        if (!prodConfig) {
            throw new Error('you should call buildProduction method before');
        }

        if (buildLib) {
            this._buildLib();
        }

        (0, _webpack2['default'])(prodConfig, this.defaultErrorHandler);
    };

    WebpackCoc.prototype.runDevelopment = function runDevelopment() {
        var devConfig = this.finalConfig.development;
        if (!devConfig) {
            throw new Error('you should call buildDevelopment method before');
        }
        var server = new _webpackDevServer2['default']((0, _webpack2['default'])(devConfig), {
            hot: true,
            publicPath: devConfig.output.publicPath || 'http://localhost:' + this.options.dev_port,
            stats: {
                colors: true
            }
        });
        server.listen(this.options.dev_port, 'localhost');
    };

    WebpackCoc.prototype._makeEntry = function _makeEntry() {
        var entries = {};
        var srcPath = this.options['src_path'];
        var project_name = this.options['project_name'];
        var entryFiles = _glob2['default'].sync(_path2['default'].join(srcPath, './**/*.entry.js'));
        for (var i = 0; i < entryFiles.length; i++) {
            var filePath = entryFiles[i];
            var key = _path2['default'].relative(srcPath, filePath);
            key = key.substring(0, key.lastIndexOf('.'));
            entries[key] = entryFiles[i];
        }
        return entries;
    };

    WebpackCoc.prototype._makeDevEntry = function _makeDevEntry() {
        var entries = this.entries;
        var devEntries = {};
        for (var i in entries) {
            devEntries[i] = ['webpack-dev-server/client?http://0.0.0.0:' + this.options.dev_port, 'webpack/hot/dev-server', entries[i]];
        }
        return devEntries;
    };

    WebpackCoc.prototype.defaultErrorHandler = function defaultErrorHandler(err, stats) {
        if (err) {
            throw new err();
        }
        var jsonStats = stats.toJson();
        var errors = jsonStats.errors;
        if (errors.length > 0) {
            console.log('' + errors.length + ' error(s), first one is:');
            throw new Error(errors[0]);
        }
        console.log(stats.toString({
            colors: true,
            children: false,
            chunks: false,
            modules: false
        }));
    };

    return WebpackCoc;
})();

exports['default'] = WebpackCoc;

WebpackCoc.webpack = _webpack2['default'];
WebpackCoc.WebpackDevServer = _webpackDevServer2['default'];

WebpackCoc.LibMap = {
    jquery: {
        path: '[node_module_path]/jquery/dist/jquery.min.js',
        //noParse:'[node_module_path]/jquery/dist/jquery.min.js',
        externals: 'jQuery'
    },
    react: {
        path: '[node_module_path]/react/dist/react.min.js',
        //noParse:'[node_module_path]/react/dist/react.min.js',
        externals: 'React'
    },
    'react-dom': {
        path: '[node_module_path]/react-dom/dist/react-dom.min.js',
        //noParse:"[node_module_path]/react-dom/dist/react-dom.min.js",
        externals: 'ReactDOM'
        /* 完整的写法,上面的写法是直接expose 到window的写法
         root:'ReactDOM',
         commonjs2: 'react-dom',
         commonjs: 'react-dom',
         amd:'react-dom'
         */
    }
};
module.exports = exports['default'];
//''