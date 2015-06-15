/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var MyUtil = function () {
};
//var http = require('http');
var request = require('request');
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');
var logger = require('libs/logHelper.js').helper;

MyUtil.prototype.get = function (url,setHtmlCharset, callback) {
       logger.writeInfo('采集的URL:'+url);
       var req = request(url, {timeout: 10000, pool: false});
       req.setMaxListeners(10);
       //req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36')
       //req.setHeader('accept', 'text/html,application/xhtml+xml');
       req.on('error', function(err) {
           logger.writeInfo(err);
       });
       req.on('response', function(res) {
           
           var bufferHelper = new BufferHelper();
           res.on('data', function (chunk) {
               bufferHelper.concat(chunk);
           });
           res.on('end',function(){
               var result = iconv.decode(bufferHelper.toBuffer(),setHtmlCharset);
               callback(result,res.statusCode);
           });
       });
}
module.exports = new MyUtil();

