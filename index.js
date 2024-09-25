const express = require("express");
const app = express();
module.exports = app;
app.use(express.json());

// API定義ファイルをインポート
const apiRoute = require("./routes/api.js");
app.use(apiRoute);
// HTML、CSS、JS、画像などの置き場所はpublicに
app.use(express.static("public"));

//サーバの起動
app.listen(3000, function () {
  const start = Date.now();
  console.log("server started");
});
//ここから上は全く分からないのでコピペしてお借りしました。

