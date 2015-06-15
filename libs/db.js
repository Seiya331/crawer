/**
 * Created by apple on 15-6-14.
 */
/*
 * 数据库连接配置模块
 */

var settings = require('../config/db_config.js');
var mongoose = require('mongoose');
var dns = 'mongodb://'+settings.host+':'+settings.port+'/'+settings.db;
mongoose.connect(dns);
module.exports.mongoose = mongoose;