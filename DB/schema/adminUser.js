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
  //  用户名
  username: {
    type: String,
    //  验证
    required: true,
    //  生成唯一的索引
    unique: true,
  },
  //  密码
  password: {
    type: String,
    required: true,
    default: md5("000000"),
  },
  //   关联的表
  role: {
    required: true,
    type: mongoose.Types.ObjectId,
    ref: "role",
  },
  //  令牌
  token: {
    type: String,
  },
  //  令牌过期时间
  expires: {
    type: Number,
    // new Date 返回当前的本地日期和时间
    // date now 返回当前日期和时间的Date对象与'1970/01/01 00:00:00'之间的毫秒值(北京时间的时区为东8区，起点时间实际为：'1970/01/01 08:00:00')
    // getTime()返回Date对象与'1970/01/01 00:00:00'之间的毫秒值(北京时间的时区为东8区，起点时间实际为：'1970/01/01 08:00:00') 。
    // 过期时间默认值
    default: new Date(Date.now() + 1000 * 60 * 60).getTime(),
  },
});
module.exports = schema;
