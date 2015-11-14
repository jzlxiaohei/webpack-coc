'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

var _assetsWebpackPlugin = require('assets-webpack-plugin');

var _assetsWebpackPlugin2 = _interopRequireDefault(_assetsWebpackPlugin);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _utilsReplaceHolder = require('./utils/replaceHolder');

var _utilsReplaceHolder2 = _interopRequireDefault(_utilsReplaceHolder);

var _defaultConfigProductionNormalConfig = require('./defaultConfig/production/normal.config');

var _defaultConfigProductionNormalConfig2 = _interopRequireDefault(_defaultConfigProductionNormalConfig);

var _defaultConfigProductionLibConfig = require('./defaultConfig/production/lib.config');

var _defaultConfigProductionLibConfig2 = _interopRequireDefault(_defaultConfigProductionLibConfig);

var _defaultConfigDevelopmentConfg = require('./defaultConfig/development/confg');

var _defaultConfigDevelopmentConfg2 = _interopRequireDefault(_defaultConfigDevelopmentConfg);

var objectAssign = require('object-assign');

var basicOptions = {
    project_name: false,
    src_path: true,
    dist_path: true,
    node_module_path: true,
    map_json_filename: false,
    map_json_path: true,
    libs: false, //default []
    dev_port: false // 9527
};

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
        options.dev_port = options.dev_port || 9527;
        this.options = options;
        this.holders = {};
        for (var i in options) {
            var val = options[i];
            this.holders['[' + i + ']'] = '' + val;
        }
        this.init();
        this.defaultConfig = {
            productionNormal: _defaultConfigProductionNormalConfig2['default'],
            productionLib: _defaultConfigProductionLibConfig2['default'],
            development: _defaultConfigDevelopmentConfg2['default']
        };
    }

    _createClass(WebpackCoc, [{
        key: 'init',
        value: function init() {
            var options = this.options;
            this.__assetsPluginInstance = new _assetsWebpackPlugin2['default']({
                filename: options.map_json_filename || 'webpack-assets.json',
                path: options.map_json_path,
                update: true,
                prettyPrint: true,
                fullPath: false
            });
            this.entries = this.makeEntry();

            this.devEntries = this.makeDevEntry();
            this.__initLib();
        }
    }, {
        key: '__initLib',
        value: function __initLib() {
            var libs = this.options.libs || [];
            var LibMap = WebpackCoc.LibMap;
            this.alias = {};
            this.noParse = [];
            this.externals = {};
            for (var i = 0; i < libs.length; i++) {
                var lib = libs[i];
                if (!(lib in LibMap)) {
                    throw new Error('cannot find ' + lib + ' in WebpackCoc.LibMap,make sure you config the item properly');
                }
                var libConfig = LibMap[lib];
                this.alias[lib] = libConfig.alias;
                this.noParse.push(libConfig.noParse || libConfig.alias);
                this.externals[lib] = libConfig.externals;
            }
        }
    }, {
        key: 'getProductionNormal',
        value: function getProductionNormal() {
            var originConfig = (0, _clone2['default'])(this.defaultConfig.productionNormal);
            originConfig.plugins.push(this.__assetsPluginInstance);
            originConfig.entry = this.entries;
            originConfig.resolve.alias = this.alias;
            originConfig.module.noParse = this.noParse;
            originConfig.externals = this.externals;
            if (this.options.save_config) {}
            return (0, _utilsReplaceHolder2['default'])(this.holders, originConfig);
        }
    }, {
        key: 'getProductionLib',
        value: function getProductionLib() {
            var originConfig = (0, _clone2['default'])(this.defaultConfig.productionLib);
            originConfig.plugins.push(this.__assetsPluginInstance);
            originConfig.resolve.alias = this.alias;
            originConfig.module.noParse = this.noParse;
            return (0, _utilsReplaceHolder2['default'])(this.holders, originConfig);
        }
    }, {
        key: 'getDevelopment',
        value: function getDevelopment() {
            var originConfig = (0, _clone2['default'])(this.defaultConfig.development);
            objectAssign(originConfig.entry, this.devEntries);
            originConfig.resolve.alias = this.alias;
            originConfig.module.noParse = this.noParse;
            return (0, _utilsReplaceHolder2['default'])(this.holders, originConfig);
        }
    }, {
        key: 'runProduction',
        value: function runProduction() {
            (0, _webpack2['default'])(this.getProductionLib(), this.defaultErrorHandler);
            (0, _webpack2['default'])(this.getProductionNormal(), this.defaultErrorHandler);
        }
    }, {
        key: 'runDevelopment',
        value: function runDevelopment() {
            var devConfig = this.getDevelopment();
            var server = new WebpackDevServer((0, _webpack2['default'])(devConfig), {
                hot: true,
                publicPath: devConfig.output.publicPath || 'http://localhost:' + this.options.dev_port,
                stats: {
                    colors: true
                }
            });
            server.listen(this.options.dev_port, 'localhost');
        }
    }, {
        key: 'makeEntry',
        value: function makeEntry() {
            var entries = {};
            var srcPath = this.options['src_path'];
            var entryFiles = _glob2['default'].sync(_path2['default'].join(srcPath, './**/*.entry.js'));
            for (var i = 0; i < entryFiles.length; i++) {
                var filePath = entryFiles[i];
                var key = _path2['default'].relative(srcPath, filePath);
                key = key.substring(0, key.lastIndexOf('.'));
                entries[key] = entryFiles[i];
            }
            return entries;
        }
    }, {
        key: 'makeDevEntry',
        value: function makeDevEntry() {
            var entries = this.entries;
            var devEntries = {};
            for (var i in entries) {
                devEntries[i] = ['webpack-dev-server/client?http://0.0.0.0:' + this.options.dev_port, 'webpack/hot/dev-server', entries[i]];
            }
            return devEntries;
        }
    }, {
        key: 'defaultErrorHandler',
        value: function defaultErrorHandler(err, stats) {
            if (err) {
                throw new err();
            }
            var jsonStats = stats.toJson();
            var errors = jsonStats.errors;
            if (errors.length > 0) {
                console.log('' + errors.length + ' error(s), first one is:');
                throw new Error(errors[0]);
            }
        }
    }]);

    return WebpackCoc;
})();

exports['default'] = WebpackCoc;

WebpackCoc.LibMap = {
    jquery: {
        alias: '[node_module_path]/jquery/dist/jquery.min.js',
        noParse: '[node_module_path]/jquery/dist/jquery.min.js',
        externals: 'jQuery'
    },
    react: {
        alias: '[node_module_path]/react/dist/react.min.js',
        noParse: '[node_module_path]/react/dist/react.min.js',
        externals: 'React'
    },
    'react-dom': {
        alias: '[node_module_path]/react-dom/dist/react-dom.min.js',
        noParse: '[node_module_path]/react-dom/dist/react-dom.min.js',
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