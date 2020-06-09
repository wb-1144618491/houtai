// // 引入本地模块：require
var mongoose = require("mongoose");
var crypto = require("crypto");
var Schema = mongoose.Schema;

function md5(password) {
  // crypto.createHmac("加密方式", "秘钥");
  let md5Hmac = crypto.createHmac("md5", "houtai");
  //   md5Hmac.update(password);要处理的字符串
  md5Hmac.update(password);
  //   md5Hmac.digest("hex");结果输出格式
  return md5Hmac.digest("hex");
}
//管理员模型
var schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    default: md5("000000"),
  },
  role: {
    required: true,
    type: mongoose.Types.ObjectId,
    ref: "role",
  },
  // 令牌
  token: {
    type: String,
    // unique: true
  },
  // 令牌过期时间
  expires: {
    type: Number,
    default: new Date(Date.now() + 1000 * 60 * 60).getTime(),
  },
});

module.exports = schema;
