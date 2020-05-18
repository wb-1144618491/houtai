var mongoose = require("mongoose");
var Schema = mongoose.Schema;
// 电影模型
var schema = new Schema({
  // 名字
  moviename: {
    type: String,
    default: "盗墓笔记",
    required: true,
  },
  //   描述
  moviedes: {
    type: String,
  },
  //   封面图
  moviecover: {
    type: String,
  },
  //  关联
  cinema: {
    required: true,
    type: mongoose.Types.ObjectId,
    ref: "cinema",
  },
});
module.exports = schema;
