var helper = {};
exports.helper = helper;

var log4js = require('log4js');
var fs = require("fs");
var path = require("path");
var is_console =true;
// 加载配置文件

var objConfig = JSON.parse(fs.readFileSync(path.join(__dirname,"../config/log4js.json"), "utf8"));
// 检查配置文件所需的目录是否存在，不存在时创建
if(objConfig.appenders){
    var baseDir = objConfig["customBaseDir"];
    var defaultAtt = objConfig["customDefaultAtt"];

    for(var i= 0, j=objConfig.appenders.length; i<j; i++){
        var item = objConfig.appenders[i];
        if(item["type"] == "console")
            continue;

        if(defaultAtt != null){
            for(var att in defaultAtt){
                if(item[att] == null)
                    item[att] = defaultAtt[att];
            }
        }
        if(baseDir != null){
            if(item["filename"] == null)
                item["filename"] = baseDir;
            else
                item["filename"] = baseDir + item["filename"];
        }
        var fileName = item["filename"];
        if(fileName == null)
            continue;
        var pattern = item["pattern"];
        if(pattern != null){
            fileName += pattern;
        }
        var category = item["category"];

        var dir = path.dirname(fileName);
        checkAndCreateDir(dir);
    }
}

// 目录创建完毕，才加载配置，不然会出异常
log4js.configure(objConfig);

var logDebug = log4js.getLogger('logDebug');
var logInfo = log4js.getLogger('logInfo');
var logWarn = log4js.getLogger('logWarn');
var logErr = log4js.getLogger('logErr');
var console = log4js.getLogger('console');
helper.writeDebug = function(msg){
    if(msg == null)
        msg = "";
    if(is_console){
        console.debug(msg);
    }else {
        logDebug.debug(msg);
    }
};

helper.writeInfo = function(msg){
    if(msg == null)
        msg = "";
    if(is_console){
        console.info(msg);
    }else {
        logInfo.info(msg);
    }
};

helper.writeWarn = function(msg){
    if(msg == null)
        msg = "";
    if(is_console){
        console.warn(msg);
    }else {
        logWarn.warn(msg);
    }
};

helper.writeError = function(msg, exp){
    if(msg == null)
        msg = "";
    if(exp != null)
        msg += "\r\n" + exp;
    if(is_console){
        console.error(msg);
    }else {
        logErr.error(msg);
    }
};

// 配合express用的方法
exports.use = function(app) {
    //页面请求日志, level用auto时,默认级别是WARN
    app.use(log4js.connectLogger(logInfo, {level:'debug', format:':method :url'}));
}

// 判断日志目录是否存在，不存在时创建日志目录
function checkAndCreateDir(dir){
    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

