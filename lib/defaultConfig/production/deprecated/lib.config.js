'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _shareConfig = require('./_share.config');

var _shareConfig2 = _interopRequireDefault(_shareConfig);

var _clone = require('clone');

var _clone2 = _interopRequireDefault(_clone);

var libConfig = (0, _clone2['default'])(_shareConfig2['default']);
//libConfig.externals={}
libConfig.entry = {
    lib: '[src_path]/lib/lib.js'
};
exports['default'] = libConfig;
module.exports = exports['default'];