// 引入
var mongoose = require("mongoose");

class Db {
  constructor(dbname) {
    this.url = `mongodb://127.0.0.1:27017/${dbname}`;
  }
  connect() {
    var p = new Promise((resolve, reject) => {
      // 防止重复连接
      if (mongoose.connection.readyState == 1) {
        resolve();
        return;
      }
      mongoose.connect(
        this.url,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
    return p;
  }
  //   处理model和schema同名
  findModel(model_name) {
    let schema_name = model_name;
    let schema = require(`./schema/${schema_name}`);
    // 创建model
    // mongoose.model(集合名字, 模式类型);
    var model = mongoose.model(model_name, schema);
  }
  //普通查询
  async find({ model_name = "", query = {}, callback } = {}) {
    try {
      await this.connect();
      this.findModel(model_name).find(query, (err, rst) => {
        if (err) {
          callback({
            error_code: 101,
            reason: "查询失败",
            result: err,
          });
        } else {
          callback({
            error_code: 0,
            reason: "查询成功",
            result: rst,
          });
        }
      });
    } catch (err) {
      callback({
        error_code: 102,
        reason: "连接失败",
        result: err,
      });
    }
  }
  // 嵌套连接查询(多个集合嵌套关联的情况

  async populate({
    model_name = "",
    query = {},
    refs = {},
    skip = 0,
    limit = 5,
    sort = {},
    callback,
  } = {}) {
    try {
      await this.connect();
      // 动态schema
      refs.forEach((ref) => {
        this.this.findModel(ref);
      });
      // 动态生成递归模式的populate
      var populates = [];
      refs.forEach((ref) => {
        var populate = {};
        populate.path = ref;
        populates.push(populate);
      });
      for (let i = 0; i < populates.length - 1; i++) {
        populates[i].populate = populates[i + 1];
      }

      this.findModel(model_name)
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate(populates[0])
        .exec((err, rst) => {
          if (err) {
            callback({
              error_code: 101,
              reason: "查询失败",
              result: err,
            });
          } else {
            callback({
              error_code: 0,
              reason: "查询成功",
              result: rst,
            });
          }
        });
    } catch (err) {
      // 连接失败
      callback({
        error_code: 102,
        reason: "连接失败",
        result: err,
      });
    }
  }
  // 合并连接查询
  async combinPopulate({
    model_name = "",
    query = {},
    refs = {},
    skip = 0,
    limit = 5,
    sort = {},
    callback,
  } = {}) {
    try {
      await this.connect();
      // 动态schema
      refs.forEach((ref) => {
        this.findModel(ref);
      });

      var populates = [];
      refs.forEach((ref) => {
        var populate = {};
        populate.path = ref;
        populates.push(populate);
      });
      for (let i = 0; i < populates.length; i++) {
        populates[i].populate = populates[i + 1];
      }

      this.findModel(model_name)
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate(populates[0])
        .exex((err, rst) => {
          if (err) {
            callback({
              error_code: 101,
              reason: "查询失败",
              result: err,
            });
          } else {
            callback({
              error_code: 0,
              reason: "查询成功",
              result: rst,
            });
          }
        });
    } catch (err) {
      callback({
        error_code: 102,
        reason: "连接失败",
        result: err,
      });
    }
  }
  // 根据id查询数据
  async findById({ model_name = "", id = "", callback } = {}) {
    try {
      await this.connect();
      this.findModel(model_name).findById(id, (err, rst) => {
        if (err) {
          callback({
            error_code: 101,
            reason: "查询失败",
            result: err,
          });
        } else {
          callback({
            error_code: 0,
            reason: "查询成功",
            result: rst,
          });
        }
      });
    } catch (err) {
      callback({
        error_code: 102,
        reason: "连接失败",
        result: err,
      });
    }
  }
  // 分页查询数据
  // skit= (page-1)*limit
  async pagination({
    model_name = "",
    query = {},
    skit = 0,
    limit = 5,
    sort = {},
    callback,
  } = {}) {
    try {
      await this.connect(),
        this.findModel(model_name)
          .find(query)
          .skip(skip)
          .limit(limit)
          .sort(sort)
          .exec((err, rst) => {
            if (err) {
              callback({ error_code: 101, reason: "查询失败", result: err });
            } else {
              callback({ error_code: 0, reason: "查询成功", result: rst });
            }
          });
    } catch (err) {
      callback({ error_code: 102, reason: "连接失败", result: err });
    }
  }
  //   查询数量
  async count({ model_name = "", query = {}, callback } = {}) {
    try {
      await this.connect();
      this.findModel(model_name).count(query, (err, rst) => {
        if (err) {
          callback({ error_code: 101, reason: "查询失败", result: err });
        } else {
          callback({ error_code: 0, reason: "查询成功", result: rst });
        }
      });
    } catch (err) {
      callback({ error_code: 102, reason: "连接失败", result: err });
    }
  }
  //   新增数据
  async insert({ model_name = "", data = {}, callback } = {}) {
    try {
      await this.connect();
      this.model_name(model_name).insertMany(data, (err, rst) => {
        if (err) {
          callback({ error_code: 101, reason: "新增失败", result: err });
        } else {
          callback({ error_code: 0, reason: "新增成功", result: rst });
        }
      });
    } catch (err) {
      callback({ error_code: 102, reason: "连接失败", result: err });
    }
  }
  // 更新数据库
  async update({ model_name = "", query = {}, data = {}, callback } = {}) {
    try {
      await this.connect();
      this.findModel(model_name).updateMany(
        query,
        { $set: data },
        (err, rst) => {
          if (err) {
            callback({ error_code: 101, reason: "修改失败", result: err });
          } else {
            callback({ error_code: 0, reason: "修改成功", result: rst });
          }
        }
      );
    } catch (err) {
      callback({ error_code: 102, reason: "连接失败", result: err });
    }
  }
  // 删除数据
  async delete({ model_name = "", query = {}, callback } = {}) {
    try {
      await this.connect();
      this.findModel(model_name).deleteMany(query, (err, rst) => {
        if (err) {
          callback({ error_code: 101, resaon: "删除失败", result: err });
        } else {
          callback({ error_code: 0, resaon: "删除成功", result: err });
        }
      });
    } catch (err) {
      callback({ error_code: 102, reason: "连接失败", result: err });
    }
  }
}
module.exports = Db;
/*
skip 指定跳过的文档条数。
limit 指定查询结果的最大条数。
skip 指定跳过的文档条数。
count  声明一个 count 查询
sort 设置排序
exec 执行查询
populated 指定哪些字段需要关联查询（populated）其他文档。
  */
