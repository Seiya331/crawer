var express = require('express');
var router = express.Router();
var myUtil = require('../libs/myUtil.js');
var cheerio = require("cheerio");
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');
var fs = require('fs');
var path = require('path');
var logger = require('../libs/logHelper.js').helper;
var Source = require('../models/source.js');


/* GET home page. */
router.get('/', function crawer(req, res, next) {

    res.render('index', {title: 'Express'});
});

router.get('/crawer', crawer);


//这个地方对数据进行抓取
function crawer(req, res, next) {
    var url_Config = JSON.parse(fs.readFileSync(path.join(__dirname, "../config/crawer_url.json"), "utf8"));
    if (!url_Config) {
        logger.writeError('加载url配置文件错误');
    }
    var url = 'http://www.tj.lss.gov.cn/ecdomain/framework/tj/lmmocpaognnebbodkdcapfopklbljheg.jsp';

    myUtil.get(url, 'UTF8', function (content, status)
    {
        var $ = cheerio.load(content);
        var all_url = [];
        $('.data_line').each(function (i, e) {
            var url_info = {};
            var url_str = $(e).find('.ALink').attr("href");
            url_str = 'http://www.tj.lss.gov.cn/' + url_str;
            url_info.url = url_str;
            //logger.writeInfo('获取URL:'+url_str);
            all_url.push(url_info);

        });
        logger.writeDebug('抓取URL完成');
        if (all_url != []) {
            for (var i in all_url) {
                logger.debug(i);
                var content_url = all_url[i]['url'];
                logger.writeInfo('抓取URL内容:' + content_url);
                myUtil.get(content_url, 'UTF8', function (content_info, status) {
                    logger.wrtedebug(content_url);
                    var $ = cheerio.load(content_info);
                    var content_data = $("#newsall").html();
                    
                    var newSource ={
                        'url':content_url,
                        'content':''
                    };
                    Source.findByUrl(newSource.url, function (err, obj) {
                        if (obj)
                            err = 'url already exists.';
                        if (err) {
                            logger.writeWarn(err);

                        } else {

                            Source.save(newSource,function (err) {
                                if (err) {
                                    logger.writeError(err);
                                } else {
                                    logger.writeInfo('插入成功');
                                }

                            });
                        }
                    });

                });
            }
        }

        logger.writeInfo('采集内容结束');
        res.send('');
    });




    //res.render('index', { title: 'Express' });
}
//
//
//function crawer(req, res, next) {
//    url = "http://v.huatu.com/daohang/";
//
//    myUtil.get(url, function (content, status)
//    {
//
//        var $ = cheerio.load(content);
//        var all_url = [];
//        $('td a').each(function (i, e) {
//            var url_info = {};
//            var url_str = $(e).attr("href");
//            if (url_str !== '' && url_str != undefined && url_str.indexOf('http') >= 0) {
//                url_info.url = url_str;
//                url_info.name = $(e).text();
//                all_url.push(url_info);
//            }
//        });
//        logger.info(all_url);
//        fs.writeFile(path.join(__dirname, '../config/url.conf.js'), JSON.stringify(all_url), function (err) {
//            if (err) {
//                logger.error('创建文件错误：'+err);
//            }
//            logger.info("Export Account Success!");
//        });
//        res.send(all_url);
//    });
//
//    //res.render('index', { title: 'Express' });
//}

module.exports = router;