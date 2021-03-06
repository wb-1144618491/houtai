var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var DB = require("./DB/db");
// apiRouter为后台路由
var apiRouter = require("./routes/apiRouter");
// frontRouter为前台路由
var frontRouter = require("./routes/frontRouter");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// 前台接口
app.use("/api", frontRouter);

app.use((req, res, next) => {
  // console.log(req.body);
  if (req) {
    let db = new DB("houtai");
    db.findById({
      model_name: "adminuser",
      id: req.headers.token,
      callback: (rst) => {
        if (!rst.result) {
          res.send({
            error_code: 403,
            reason: "账号不存在",
            result: null,
          });
        } else if (Date.now() > rst.result.expires) {
          res.send({
            error_code: "402",
            reason: "token过期,请重新登录",
            result: null,
          });
        } else {
          next();
        }
      },
    });
  } else if (req.url != "/api/admin/login") {
    res.send({
      error_code: 401,
      resaon: "你还没有登录请登录",
      result: null,
    });
  } else {
    next();
  }
});
// 后台接口
app.use("/api", apiRouter);

module.exports = app;
