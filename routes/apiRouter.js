var express = require("express");
var router = express.Router();
var DB = require("../DB/db");
var crypto = require("crypto");
var db = new DB("houtai");
/*加密密码 */
function md5(password) {
  let md5Hmac = crypto.createHmac("md5", "houtai");
  md5Hmac.update(password);
  return md5Hmac.digest("hex");
}
/* model常量定义 */
const MODEL_LIMIT = "limit"; //权限
const MODEL_ROLE = "role"; //角色
const MODEL_ADMIN_USER = "adminuser"; //管理账户
/***************** 后台操作接口 ******************/
/* **********权限接口*********** */

router.post("/admin/addlimit", (req, res) => {
  console.log(req.body);
  let { pid, limitname, title } = req.body;

  db.insert({
    model_name: MODEL_LIMIT,
    data: { pid, limitname, title },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 修改权限
router.post("/admin/updatelimit", (req, res) => {
  let { _id, pid, limitname, title } = req.body;
  db.update({
    model_name: MODEL_LIMIT,
    query: { _id },
    data: { pid, limitname, title },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 删除权限
router.post("/admin/deletelimit", (req, res) => {
  let { _id } = req.body;
  db.delete({
    model_name: MODEL_LIMIT,
    query: { _id },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 查询权限（分页查询）
router.get("/admin/getlimit", (req, res) => {
  let { currpage } = req.query;

  db.pagination({
    model_name: MODEL_LIMIT,
    skip: (currpage - 1) * 5,
    limit: 5,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 查询权限（所有权限）

router.get("/admin/getlimitall", (req, res) => {
  db.find({
    model_name: MODEL_LIMIT,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 查询权限列表数据条数
router.get("/admin/getlimitcount", (req, res) => {
  db.count({
    model_name: MODEL_LIMIT,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
/*********************** 角色操作 ****************************/
// 新增角色
router.post("/admin/addrole", (req, res) => {
  // limit为权限id ，注意objectID类型
  let { rolename, limit } = req.body;
  db.insert({
    model_name: MODEL_ROLE,
    data: { rolename, limit },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 修改角色
router.post("/admin/updaterole", (req, res) => {
  // linmit为权限的id,注意是objectID类型
  let { _id, rolename, limit } = req.body;
  db.update({
    model_name: MODEL_ROLE,
    query: { _id },
    data: { rolename, limit },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 删除角色
router.post("/admin/deleterole", (req, res) => {
  let { _id } = req.body;
  db.delete({
    model_name: MODEL_ROLE,
    query: { _id },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 查询角色（分页查询）
router.get("/admin/getrole", (req, res) => {
  let { currpage } = req.body;
  db.pagination({
    model_name: MODEL_ROLE,
    skit: (currpage - 1) * 5,
    limit: 5,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 查询角色
router.get("/admin/getaddrole", (req, res) => {
  db.find({
    model_name: MODEL_ROLE,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 查询角色列表数据条数
router.get("/admin/getrolecount", (req, res) => {
  db.count({
    model_name: MODEL_ROLE,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
/*************************管理员操作******************************/
// 新增管理员
router.post("/admin/addeuser", (req, res) => {
  let { username, role } = req.body;
  db.insert({
    model_name: MODEL_ADMIN_USER,
    data: { username, role },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 修改管理员
router.post("/admin/updateuser", (req, res) => {
  let { _id, username, role } = req.body;
  db.update({
    model_name: MODEL_ADMIN_USER,
    query: { _id },
    data: { username, role },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 删除管理员
router.post("/admin/deleteuser", (req, res) => {
  let { _id } = req.body;
  db.delete({
    model_name: MODEL_ADMIN_USER,
    query: { _id },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 管理员列表查询
router.get("/admin/getalladminuser", (req, res) => {
  db.populate({
    model_name: MODEL_ADMIN_USER,
    refs: ["role", "limit"],
    callback: (rst) => {
      res.rend(rst);
    },
  });
});
// 分页查询
router.get("/admin/getadminuser", (req, res) => {
  let { currpage } = req.body;
  db.populate({
    model_name: MODEL_ADMIN_USER,
    refs: ["role", "limit"],
    skip: (currpage - 1) * 5,
    limit: 5,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 查询用户列表数据条数
router.get("/admin/getadminusercount", (req, res) => {
  db.count({
    model_name: MODEL_ADMIN_USER,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 通过_id 查询当前管理员信息（主要查询关联的权限信息）
router.get("/admin/getadminuserbyid", function (req, res) {
  let { _id } = req.query;
  db.populate({
    model_name: MODEL_ADMIN_USER,
    query: { _id },
    refs: ["role", "limit"],
    callback: (rst) => {
      res.send(rst);
      console.log(rst);
    },
  });
});
// 管理员登录
router.post("/admin/login", (req, res) => {
  // console.log(req, res);
  let { username, password } = req.body;
  password = md5(password);
  db.find({
    model_name: MODEL_ADMIN_USER,
    query: { username, password },
    callback: (rst) => {
      console.log(rst);
      if (rst.result.length > 0) {
        let id = rst.result[0]._id;
        // 登陆成功把token更新上去
        db.update({
          model_name: MODEL_ADMIN_USER,
          query: { username },
          data: {
            token: id,
            expires: new Date(Date.now() + 1000 * 60 * 60).getTime(),
          },
          callback: (urst) => {
            res.send(rst);
          },
        });
      } else {
        res.send({
          error_code: 101,
          resaon: "用户名或密码错误",
          result: null,
        });
      }
    },
  });
});
module.exports = router;
