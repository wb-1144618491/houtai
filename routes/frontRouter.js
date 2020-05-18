var express = require("express");
var router = express.Router();
// 加密
var crypto = require("crypto");
// 数据库
var Db = require("../DB/db");
//
var db = new Db("houtai");
// 文件
var fs = require("fs");
// 路径
var path = require("path");
// 处理表单
var formdable = require("formidable");
// 加密密码
function md5(password) {
  let mdsHmac = crypto.createHmac("md5", "houtai");
  mdsHmac.update(password);
  return md5Hmac.digest("hex");
}

// model常量定义
const MODEL_CITY = "city"; //城市列表
const MODEL_CINMEA = "cinema"; //影院列表
const MODEL_MOVIE = "movie"; //影片列表
const MODEL_SALERTYPE = "salertype"; //卖品分类
const MODEL_SALER = "saler"; //卖品列表
const MODEL_MEMBER = "member"; //会员

/*********************************前台操作接口*******************************/

/* **********************城市列表操作*********************** */
// 城市列表查询（城市列表直接把json导入进去）
router.get("/citys", (req, res) => {
  db.find({
    model_name: MODEL_CITY,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
/* *****************************影院列表操作***************************** */
// 城市对应的影院信息（影院是与城市关联的，每个城市有不同的影院，一对多的关系）
// 新增影院
router.post("/addcinemas", (req, res) => {
  let { cinmea_name, cinema_address, cityid: city } = req.body;
  db.insert({
    model_name: MODEL_CINMEA,
    data: { cinmea_name, cinema_address, city },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 修改影院信息
router.post("/updcinemas", (req, res) => {
  let { _id, cinema_name, cinema_address, cityid: city } = req.bodys;
  db.update({
    model_name: MODEL_CINMEA,
    query: { _id },
    data: { cinema_name, cinema_address, city },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 删除影院信息
router.post("/delcinemas", (req, res) => {
  let { _id } = req.body;
  db.delete({
    model_name: MODEL_CINMEA,
    query: { _id },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 分页查询影院
router.get("/cinemas", (req, res) => {
  let { currpage } = req.body;
  db.populate({
    model_name: MODEL_CINMEA,
    refs: ["city"],
    skip: (currpage - 1) * 5,
    limit: 5,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 查询影院数量
router.get("/cinemacount", (req, res) => {
  db.count({
    model_name: MODEL_CINMEA,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 根据影院id查询
router.get("/cinemabyid", (req, res) => {
  let { cinemaid } = req.body;
  db.findById({
    model_name: MODEL_CINMEA,
    id: cinemaid,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 移动端根据cityId查询当前城市下的影院信息
router.get("/cinemasbycityid", (req, res) => {
  let { cityid: city = "" } = req.body;
  db.find({
    model_name: MODEL_CINMEA,
    query: { city },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
//
router.get("/cinemaspagebycityid", (req, res) => {
  let { cityid: city = "", page = 1, size = 10 } = req.body;
  page = Number.parseInt(page);
  size = Number.parseInt(size);
  db.pagination({
    model_name: MODEL_CINMEA,
    query: { city },
    skip: (page - 1) * size,
    limit: size,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
/* 影院对应的影片信息（影片信息市影院关联的，每个影院放映的电影可能不同，多对多关系） */
// 上传影片
router.post("/admin/movie/fileupload", (req, res) => {
  var form = new formdable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    // 判断文件名如果为空，表示用户没有上传文件

    if (files.file.anme == "") {
      if (fields._id == "") {
        // 新增没有选图给默认图
        res.send({
          error_code: "0",
          reason: "成功",
          data: { url: "/houtai/zhu.jpg" },
        });
      } else {
        //  编辑没有选图，给上一次的图
        res.send({
          error_code: 0,
          reason: "成功",
          data: { url: fields.url },
        });
      }
      return;
    }
    // 有文件的情况下，目标是要将文件从临时路径剪切到目标upload目录下
    /* 
    1、判断public下是否存在upload文件夹，如果存在则不处理，反之mkdir建立文件夹
    2、给需要剪切的文件重命名，原因是用户上传的文件可能会重名
    3、=使用fs.rename方法完成剪切操作
    */
    //  1、建立public文件夹
    let root_path = path.dirname(__dirname);

    let public_path = path.join(root_path, "public");
    let upload_path = path.join(public_path, "upload");
    if (!fs.existsSync(upload_path)) {
      fs.mkdirSync(upload_path, "0777");
    }
    // 给文件重命名
    // 给文件找后缀
    let file_ext = ".jpg";
    switch (files.file.type) {
      case "image/jpeg":
      case "image/jpg":
        file_ext = ".jpg";

        break;
      case "image/png":
        file_ext = ".png";
        break;
      case "image/gif":
        file_ext = ".gif";
        break;
      default:
        break;
    }
    // 使用时间戳和随机数生成新名字
    let file_name =
      new Date().getTime + Math.ceil(Math.random() * 100) + file_ext;
    // 剪切
    let target_path = path.join(upload_path, file_name);
    // 读文件流
    let readStrema = fs.createReadStream(files.file.path);
    // 写文件流
    let writeStream = fs.createWriteStream(target_path);
    // 管道操作
    readStrema.pipe(writeStream);
    // 读失败的promise
    let readErr = new Promise((resolve, reject) => {
      readStrema.on("error", (err) => {
        reject();
      });
    });
    // 写失败的promise
    let writeErr = new Promise((resolve, reject) => {
      writeStream.on("error", (err) => {
        reject();
      });
    });
    let successCpy = new Promise((resolve, reject) => {
      readStrema.on("end", () => {
        resolve();
      });
    });
    // 任意一个失败就算失败
    Promise.race([readErr, writeErr, successCpy])
      .then(() => {
        fs.unlinkSync(files.file.path); //删除临时文件
        let url = path.join("/upload", file_name);
        res.send({
          error_code: 0,
          resaon: "成功",
          data: { url },
        });
      })
      .catch(() => {
        res.send({
          error_code: 0,
          resaon: "成功",
          data: { url: "/houtai/zhu.jpg" },
        });
      });
  });
});

/* **************影片操作**************** */
// 新增影片
router.post("/admin/addmovie", (req, res) => {
  let { moviename, moviedes, moviecover, cinema } = req.body;
  db.insert({
    model_name: MODEL_MOVIE,
    data: { moviename, moviedes, moviecover, cinema },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 更新影片
router.post("/admin/addmovie", (req, res) => {
  let { _id, moviename, moviedes, moviecover, cinema } = req.body;
  db.update({
    model_name: MODEL_MOVIE,
    query: { _id },
    data: { moviename, moviedes, moviecover, cinema },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 删除影片
router.post("/admin/delmovie", (req, res) => {
  let { _id } = req.body;
  db.delete({
    model_name: MODEL_MOVIE,
    query: { _id },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 查询影片（分页）
router.get("/moive", (req, res) => {
  let { currpage } = req.query;
  db.populate({
    model_name: MODEL_MOVIE,
    skip: (currpage - 1) * 5,
    limit: 5,
    refs: ["cinema"],
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 查询影片数量
router.get("/moviecount", (req, res) => {
  db.count({
    model_name: MODEL_MOVIE,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
router.get("/moviebycinemaid", (req, res) => {
  let { cinema } = req.query;
  db.find({
    model_name: MODEL_MOVIE,
    query: { cinema },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
/* ***************卖品类别操作************* */
// 新增卖品分类
router.post("/addsalertype", (req, res) => {
  let { salertype } = req.body;
  db.insert({
    model_name: MODEL_SALERTYPE,
    data: { salertype },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
//修改卖品分类
router.post("/updsalertype", (req, res) => {
  let { _id, salertype } = req.body;
  db.update({
    model_name: MODEL_SALERTYPE,
    query: { _id },
    data: { salertype },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 删除卖品分类
router.post("/delsalertype", (req, res) => {
  let { _id } = req.body;
  db.delete({
    model_name: MODEL_SALERTYPE,
    query: { _id },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 查询卖品分类(分页)
router.get("/salertype", (req, res) => {
  let { currpage } = req.query;
  db.pagination({
    model_name: MODEL_SALERTYPE,
    skip: (currpage - 1) * 5,
    limit: 5,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
//
router.get("/salertypelist", (req, res) => {
  db.find({
    model_name: MODEL_SALERTYPE,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 查询卖品分类梳理
router.get("/salertypecount", (req, res) => {
  db.count({
    model_name: MODEL_SALER,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
/* *******************卖品操作********************* */
// 新增卖品
router.post("/addsaler", (req, res) => {
  let {
    salertitle,
    salerdes,
    salerpice,
    salerimg,
    salertype,
    cinema,
  } = req.body;
  db.insert({
    model_name: MODEL_SALER,
    data: { salertitle, salerdes, salerpice, salerimg, salertype, cinema },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 修改卖品
router.psot("/updsaler", (req, res) => {
  let {
    _id,
    salertitile,
    salerdes,
    salerpice,
    salerimg,
    salertype,
    cinema,
  } = req.body;
  db.update({
    model_name: MODEL_SALER,
    query: { _id },
    data: { salertitile, salerdes, salerpice, salerimg, salertype, cinema },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 删除卖品
router.psot("/delsaler", (req, res) => {
  let { _id } = req.body;
  db.delete({
    model_name: MODEL_SALER,
    query: { _id },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 查询卖品
router.get("/saler", (req, res) => {
  let { currpage, limit = 5 } = req.query;
  db.combinPopulate({
    model_name: MODEL_SALER,
    skip: (currpage - 1) * 5,
    limit,
    refs: ["salertype", "cinema"],
    callback: (rst) => {
      res.send(rst);
    },
  });
});
//
router.get("/addbycinema", (req, res) => {
  let { cinema } = req.query;
  db.combinPopulate({
    model_name: MODEL_SALER,
    limit: 0,
    query: { cinema },
    refs: ["salertype", "cinema"],
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 查询所有卖品
router.get("/dsalercount", (req, res) => {
  db.count({
    model_name: MODEL_SALER,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 根据卖品所在影院查询卖品
function dealSaler(data) {
  let types = [];
  // 过滤出不重复type
  data.result.forEach((item) => {
    let type = { id: "", salertype: "", salers: [] };
    type._id = item.salertype._id;
    type.salertype = item.salertype.salertype;
    let flag = false;
    types.forEach((tp) => {
      if (tp._id == type._id) {
        flag = true;
      }
    });
    if (!flag) types.push(type);
  });
  for (let i = 0; i < data.result.length; i++) {
    let saler = data.result[i];
    for (let j = 0; j < types.length; j++) {
      if (saler.salertype._id == types[j]._id) {
        types[j].salers.push(saler);
      }
    }
  }
}
/* **********************会员操作*********************** */
// 注册会员
router.post("/registermember", (req, res) => {
  let { mobile, password } = req.body;
  db.insert({
    model_name: MODEL_MEMBER,
    data: { mobile, password },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 修改会员
router.post("/updatemember", (req, res) => {
  let { _id, mobile, password } = req.body;
  (password = md5(password)),
    db.update({
      model_name: MODEL_MEMBER,
      query: { _id },
      data: { mobile, password },
      callback: (rst) => {
        res.send(rst);
      },
    });
});
// 删除会员
router.post("/deletemember", (req, res) => {
  let { _id } = req.body;
  db.delete({
    model_name: MODEL_MEMBER,
    query: { _id },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 分页查询会员
router.get("/memberlist", (req, res) => {
  let { currpage, limit = 5 } = req.query;
  db.pagination({
    model_name: MODEL_MEMBER,
    skip: (currpage - 1) * 5,
    limit,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 会员数量查询
router.get("/membercount", (req, res) => {
  db.count({
    model_name: MODEL_MEMBER,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 会员列表查询
router.post("/getmember", (req, res) => {
  db.find({
    model_name: MODEL_MEMBER,
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 根据会员id查询会员消息
router.post("/admin/getmemberbyid", (req, res) => {
  let { _id } = req.query;
  db.findById({
    model_name: MODEL_MEMBER,
    query: { _id },
    callback: (rst) => {
      res.send(rst);
    },
  });
});
// 会员登录
router.post("/memberlogin", (req, res) => {
  let { mobile, password } = req.body;
  password = md5(password);
  db.count({
    model_name: MODEL_MEMBER,
    query: { mobile, password },
    callback: (rst) => {
      let { error_code, result } = rst;
      if (error_code == 0 && result == 1) {
        res.send({
          error_code: 0,
          resaon: "登陆成功",
          result: { mobile },
        });
      } else {
        res.send({
          error_code: 101,
          reason: "登陆失败",
          result: { mobile },
        });
      }
    },
  });
});
module.exports = router;
