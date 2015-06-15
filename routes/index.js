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
var Promise = require('bluebird');

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
            all_url.push(url_info);

        });
        logger.writeDebug('抓取URL完成');
        if (all_url != []) {
            logger.writeInfo('--------------');
            Promise.reduce(all_url, function (total, post) {
                logger.writeInfo('抓取URL内容:' + post);
                var content_url = post['url'];
                myUtil.get(content_url, 'UTF8', function (content_info, status) {
                    logger.writeInfo('抓取URL内容:' + content_url);
                    //var $ = cheerio.load(content_info);
                    //var content_data = $("#newsall").html();

                    var newSource = {
                        'url': content_url,
                        'content': ''
                    };
                    Source.findByUrl(newSource.url, function (err, obj) {
                        if (obj)
                            err = 'url already exists.';
                        if (err) {
                            logger.writeWarn(err);

                        } else {
                            Source.save(newSource, function (err) {
                                if (err) {
                                    logger.writeError(err);
                                } else {
                                    logger.writeInfo('插入成功');
                                }

                            });
                        }
                    });

                });
            }, []).then(function (total) {
                return [];
            });
            logger.writeDebug('采集内容结束');

        }

        //res.send('');
    });

    res.send('success');
}

module.exports = router;