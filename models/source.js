/**
 * 使用 mongoose 进行数据查询
 */

var mongodb = require('../libs/db.js');

var Schema = mongodb.mongoose.Schema;

var SourceSchema = new Schema({
    url: String,
    content: String,
    create_date: {type: Date, default: Date.now}

},{collection: 'source'});
var Source = mongodb.mongoose.model("source", SourceSchema);
var SourceDAO = function () {
};

SourceDAO.prototype.save = function (obj, callback) {
    var instance = new Source(obj);
    instance.save(function (err) {
        callback(err);
    });
};
SourceDAO.prototype.findByUrl = function (url, callback) {
    Source.findOne({url: url}, function (err, obj) {
        callback(err, obj);
    });
};
module.exports = new SourceDAO();