/**
 * Created by zilong on 11/11/15.
 */
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _shareConfig = require('./_share.config');

var _shareConfig2 = _interopRequireDefault(_shareConfig);

var _clone = require('clone');

var _clone2 = _interopRequireDefault(_clone);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var extraPlugins = [new _webpack2['default'].optimize.CommonsChunkPlugin({
    name: 'commons',
    filename: 'commons.js?v=[chunkhash]',
    minChunks: function minChunks(module, count) {
        //引用测试大于某个次数
        if (count >= 3) {
            return true;
        }

        var resourceName = module.resource;
        if (resourceName) {
            resourceName = resourceName.substring(resourceName.lastIndexOf(_path2['default'].sep) + 1);
        }
        var reg = /^(\w)+.common/;
        if (reg.test(resourceName)) {
            return true;
        }

        return false;
    }
})];
var productionConfig = (0, _clone2['default'])(_shareConfig2['default']);

for (var i = 0; i < extraPlugins.length; i++) {
    productionConfig.plugins.push(extraPlugins[i]);
}

exports['default'] = productionConfig;
module.exports = exports['default'];