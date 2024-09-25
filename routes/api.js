const express = require("express");
const router = express.Router();

//データベース（sqlite3)の設定
//const db = require("better-sqlite3")("library.db");

//Sample：今日の日付を返すAPI（データベースを使わないシンプルな例）
router.get("/api/today", function (req, res) {
  const current = new Date();
  const data = {
    month: current.getMonth() + 1,
    day: current.getDate(),
  };
  res.json(data);
});
