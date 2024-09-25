const express = require("express");
const router = express.Router();

//データベース（sqlite3)の設定
const db = require("better-sqlite3")("library.db");

//Sample：今日の日付を返すAPI（データベースを使わないシンプルな例）
router.get("/api/today", function (req, res) {
  const current = new Date();
  const data = {
    month: current.getMonth() + 1,
    day: current.getDate(),
  };
  res.json(data);
});

router.post('/api/query/login', (req, res) => {
  const uname = req.body.uname;
  const pass = req.body.pass;
  
  if (!uname || !pass) {
    return res.status(400).json({ success: false, message: 'ユーザーネームとパスワードを入力してください。' });
  }

  const query = `SELECT id FROM user WHERE name = ? AND pass = ?`;

  try {
    const rows = db.prepare(query).get(`${uname}`,`${pass}`);
    console.log(rows);
    res.json({ success: true, user_id: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/api/query/greeting", function (req, res) {
  // 日本時間の現在時刻を取得
  const current = new Date();
  const japanOffset = 9 * 60; // 日本標準時 (JST) はUTC+9
  const utcOffset = current.getTimezoneOffset();
  const japanTime = new Date(current.getTime() + (japanOffset - utcOffset) * 60000);

  const hour = japanTime.getHours();
  let greeting;
  //console.log(hour);
  // 時間帯に応じた挨拶を決定
  if (hour >= 6 && hour < 11) {
    greeting = "おはようございます。";
  } else if (hour >= 11 && hour < 18) {
    greeting = "こんにちは。";
  } else {
    greeting = "こんばんは。";
  }

  // レスポンスデータの作成
  const data = {
    greeting: greeting
  };
  res.json(data);
});

router.get("/api/query/book_count", function (req, res) {
  const query = `select count(*) as count
                 from book`;

  try {
    const rows = db.prepare(query).get();
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/api/query/lent_count", function (req, res) {
  const uname = req.body.username; // リクエストボディからunameを取得

  const query = `
      WITH id_search AS (
      SELECT id AS user_id
      FROM user
      WHERE user.name = ?
    )
SELECT COUNT(*) AS count
FROM borrow b
JOIN id_search i ON b.id = i.user_id
JOIN book h ON h.id = b.s_id
WHERE b.can_lent != 3
  AND (b.u_id = i.user_id OR h.u_id = i.user_id);
`; 
  
  try {
    const rows = db.prepare(query).get(uname);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



//検索に使う（初期全表示）
router.get("/api/query/search/all", function (req, res) {
  const query = `
    WITH rent AS (
  SELECT b.id AS book_id, 
         SUM(CASE 
               WHEN bo.can_lent = 0 THEN 1 
               ELSE 0 
             END) AS waiting_count,
         CASE 
           WHEN COUNT(bo.can_lent) = 3 THEN 0
           ELSE 1 
         END AS rent_status
  FROM borrow bo
  JOIN book b ON bo.s_id = b.id
  GROUP BY b.id
)
SELECT b.id,
       b_i.title, 
       b_i.writer AS author, 
       GROUP_CONCAT(t.name) as tags, 
       b_i.image, 
       rent.rent_status, 
       u.name as owner, 
       rent.waiting_count
FROM book b
JOIN book_info b_i ON b_i.id = b.b_id
JOIN user u ON u.id = b.u_id
LEFT JOIN tag t ON b_i.id = t.b_id
LEFT JOIN rent ON rent.book_id = b.id
GROUP BY b_i.title, b_i.writer, b_i.image, rent.waiting_count, rent.rent_status, u.name, b.id

  `;

  try {
    const rows = db.prepare(query).all();
    // 各本に対してタグを配列に変換
    const books = rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    }));
    res.json({ books });
    console.log(books);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//検索に使う（検索モードごとの表示）
router.get('/api/query/search/:mode', (req, res) => {
  // ルートパス '/api/query/search/:mode' にGETリクエストが送信されたときの処理
  const { title, author, tags } = req.query; // リクエストのクエリパラメータから title, author, tags を取得
  const { mode } = req.params; // ルートパスのパラメータ :mode を取得

  console.log("api ok");
  let query = `
    WITH rent AS (
  SELECT b.id AS book_id, 
         SUM(CASE 
               WHEN bo.can_lent = 1 THEN 1 
               ELSE 0 
             END) AS waiting_count,
         CASE 
           WHEN COUNT(bo.can_lent) = 0 THEN 0
           WHEN COUNT(bo.can_lent) = 3 THEN 0
           ELSE 1 
         END AS rent_status
  FROM borrow bo
  JOIN book b ON bo.s_id = b.id
  GROUP BY b.id
)
SELECT b.id,
       b_i.title, 
       b_i.writer AS author, 
       GROUP_CONCAT(t.name) as tags, 
       b_i.image, 
       rent.rent_status, 
       u.name as owner, 
       rent.waiting_count
FROM book b
JOIN book_info b_i ON b_i.id = b.b_id
JOIN user u ON u.id = b.u_id
LEFT JOIN tag t ON b_i.id = t.b_id
LEFT JOIN rent ON rent.book_id = b.id
GROUP BY b_i.title, b_i.writer, b_i.image, rent.waiting_count, rent.rent_status, u.name, b.id
  `;
  let queryParams = [];

  // 検索条件を追加する
  if (title && mode === 'title') {
    query += ' HAVING title LIKE ?';
    queryParams.push(`%${title}%`);
  } else if (author && mode === 'author') {
    query += ' HAVING author LIKE ?';
    queryParams.push(`%${author}%`);
  } else if (tags && mode === 'tags') {
    query += ' HAVING tags LIKE ?';
    queryParams.push(`%${tags}%`);
  }

  //console.log(query);
  //console.log("\nparams:"　+queryParams);
  try {
    const rows = db.prepare(query).all(queryParams);
    // 各本に対してタグを配列に変換
    const books = rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    }));
    res.json({ books });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/book/details/:id', (req, res) => {
  const id = Number(req.params.id); // ルートパスのパラメータ :id を数値に変換

  console.log("API request received for book ID:", id);

  let query = `
    WITH rent AS (
      SELECT b.id AS book_id, 
             SUM(CASE WHEN bo.can_lent = 1 THEN 1 ELSE 0 END) AS waiting_count,
             CASE 
               WHEN COUNT(bo.can_lent) = 0 THEN 0
               WHEN COUNT(bo.can_lent) = 3 THEN 0
               ELSE 1 
             END AS rent_status
      FROM borrow bo
      JOIN book b ON bo.s_id = b.id
      GROUP BY b.id
    )
    SELECT b_i.title, 
           b_i.writer AS author, 
           GROUP_CONCAT(t.name) AS tags, 
           b_i.image, 
           rent.rent_status, 
           u.name AS owner, 
           rent.waiting_count
    FROM book b
    JOIN book_info b_i ON b_i.id = b.b_id
    JOIN user u ON u.id = b.u_id
    LEFT JOIN tag t ON b_i.id = t.b_id
    LEFT JOIN rent ON rent.book_id = b.id
    WHERE b.id = ?  -- 特定のIDでフィルタリング
    GROUP BY b_i.title, b_i.writer, b_i.image, rent.waiting_count, rent.rent_status, u.name, b.id
  `;

  try {
    const rows = db.prepare(query).all(id); // パラメータを渡す
    // 各本に対してタグを配列に変換
    const books = rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    }));
    res.json({ books });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/*
router.get('/api/query/search/action', (req, res) => {
  const { username, bookId } = req.query; // ユーザー名をクエリパラメータから取得

  const getUserQuery = `
    SELECT id FROM user WHERE username = ?
  `;

  const actionQuery = `
    SELECT keep, good
    FROM action
    WHERE u_id = ?
    AND b_id = ?
  `;

  try {
    const userRow = db.prepare(getUserQuery).get(username);
    if (!userRow) {
      return res.status(404).json({ error: "User not found" });
    }

    const { id: userId } = userRow;
    const rows = db.prepare(actionQuery).get(userId, bookId);
    const result = rows || { keep: 0, good: 0 };
    res.json(result);
    console.log(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post('/api/query/update/action', (req, res) => {
  const { userId, type, bookId } = req.body;
  console.log('Received data:', { userId, type, bookId });

  const validTypes = ['keep', 'good'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: "Invalid action type" });
  }

  const selectQuery = `
    SELECT * FROM action WHERE u_id = ? AND b_id = ?
  `;

  const insertQuery = `
    INSERT INTO action (u_id, b_id, ${type})
    VALUES (?, ?, 1)
  `;

  const updateQuery = `
    UPDATE action SET ${type} = 1 WHERE u_id = ? AND b_id = ?
  `;

  try {
    const selectStatement = db.prepare(selectQuery);
    const row = selectStatement.get(userId, bookId);

    if (row) {
      const updateStatement = db.prepare(updateQuery);
      updateStatement.run(userId, bookId);
    } else {
      const insertStatement = db.prepare(insertQuery);
      insertStatement.run(userId, bookId);
    }

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

*/

router.post('/api/query/create/borrow',  (req, res) => {
  const { bookId, username } = req.body;

  const query = `
    WITH user_data AS (
      SELECT id AS user_id FROM user WHERE name = ?
    )
    INSERT INTO borrow (u_id, s_id, time, waiting, can_lent)
    SELECT user_id, ?, datetime('now'), 0, 1
    FROM user_data
  `;

  try {
    db.prepare(query).run(username, bookId);
    res.json({ message: "Borrow request created successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post('/api/query/create/book', (req, res) => {
  const { username, title, author, image, tags, mode } = req.body;

  if (!title || !author) {
    return res.json({ success: false, message: 'タイトルと著者名は必須です。' });
  }

  // トランザクションを開始
  const transaction = db.transaction((data) => {
    const { title, author, image, tags, userId } = data;

    // book_info テーブルに本の情報を追加
    const insertBookInfo = db.prepare('INSERT INTO book_info (title, writer, image) VALUES (?, ?, ?)');
    const bookInfoResult = insertBookInfo.run(title, author, image);
    const bookInfoId = bookInfoResult.lastInsertRowid;

    // book テーブルに関連情報を追加
    const insertBook = db.prepare('INSERT INTO book (b_id, u_id) VALUES (?, ?)');
    insertBook.run(bookInfoId, userId);

    // タグの処理
    const insertTag = db.prepare('INSERT INTO tag (b_id, name) VALUES (?, ?)');
    tags.forEach(tag => {
      insertTag.run(bookInfoId, tag);
    });
  });

  // ユーザーIDを取得するクエリ
  const getUserId = db.prepare('SELECT id FROM user WHERE name = ?');

  try {
    // ユーザーIDを取得
    const userIdResult = getUserId.get(username);
    if (!userIdResult) {
      return res.json({ success: false, message: 'ユーザーが見つかりません。' });
    }
    const userId = userIdResult.id;

    // トランザクションを実行
    transaction({ title, author, image, tags, userId });
    res.json({ success: true, message: '本が正常に登録されました。' });
  } catch (err) {
    console.error('Error:', err);
    res.json({ success: false, message: '登録に失敗しました。' });
  }
});


router.get('/api/query/search/book', (req, res) => {
  const { title } = req.query;

  if (!title) {
    return res.json([]);
  }

  db.all(`SELECT bi.id AS book_id, bi.title, bi.writer, bi.image, GROUP_CONCAT(t.name) AS tags
          FROM book_info bi
          LEFT JOIN book b ON bi.id = b.b_id
          LEFT JOIN tag t ON bi.id = t.b_id
          WHERE bi.title LIKE ?
          GROUP BY bi.id`, [`%${title}%`], (err, rows) => {
    if (err) {
      return res.json([]);
    }
    res.json(rows.map(row => ({
      title: row.title,
      author: row.writer,
      image: row.image,
      tags: row.tags ? row.tags.split(',') : []
    })));
  });
});

router.get('/api/query/borrowed_books', (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ success: false, message: 'ユーザーネームが必要です。' });
  }

  const query = `
    SELECT b.id AS book_id, 
           b_i.title AS book_title, 
           u.name AS owner_name, 
           bo.time , 
           CASE 
             WHEN bo.can_lent = 1 THEN '借りている' 
             WHEN bo.can_lent = 0 THEN '待機中' 
             WHEN bo.can_lent = 2 THEN '返却待機中' 
             ELSE '返却済' 
           END AS book_status
    FROM borrow bo
    JOIN book b ON bo.s_id = b.id
    JOIN book_info b_i ON b.b_id = b_i.id
    JOIN user u ON b.u_id = u.id
    JOIN user ub ON bo.u_id = ub.id
    WHERE ub.name = ? 
    ORDER BY bo.time DESC
  `;

  try {
    const rows = db.prepare(query).all(username).map(book => ({
      id: book.book_id || "",
      title: book.book_title || "",
      owner: book.owner_name || "",
      time: book.time || "",
    }));
    res.json({ success: true, borrowed_books: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get('/api/query/lent_books', (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ success: false, message: 'ユーザーネームが必要です。' });
  }

  const query = `
    SELECT b.id AS book_id, 
           b_i.title AS book_title, 
           ub.name AS borrower_name, 
           bo.time , 
           CASE 
             WHEN bo.can_lent = 0 THEN '未貸出' 
             WHEN bo.can_lent = 1 THEN '貸出中' 
             WHEN bo.can_lent = 2 THEN '返却中' 
             ELSE '返却済' 
           END AS book_status
    FROM borrow bo
    JOIN book b ON bo.s_id = b.id
    JOIN book_info b_i ON b.b_id = b_i.id
    JOIN user u ON b.u_id = u.id
    JOIN user ub ON bo.u_id = ub.id
    WHERE u.name = ? 
    ORDER BY bo.time DESC
  `;

  try {
    const rows = db.prepare(query).all(username).map(book => ({
      id: book.book_id || "",
      title: book.book_title || "",
      borrower: book.borrower_name || "",
      time: book.time || "",
    }));
    res.json({ success: true, lent_books: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});





/////////////////////////////////////////////////////////////

//ここから下は前のやつ
router.post("/api/query/name", function (req, res) {
  const id = req.body.id; // Assuming ID is sent in the request body

  const query = `SELECT name 
                 FROM user
                 WHERE id = ?`;

  try {
    const rows = db.prepare(query).all(id); // Bind ID to the query
    console.log(rows);
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' }); // Handle errors appropriately
  }
});

router.post("/api/query/data", function (req, res) {
  const id = req.body.id; // Assuming ID is sent in the request body

  const query = `SELECT f.genre,f.f_name,l.like_n,l.food_id 
                 FROM user u,_like l, food f
                 WHERE u.id = ?
                 AND u.id = l.user_id
                 AND l.food_id = f.id`;

  try {
    const rows = db.prepare(query).all(id); // Bind ID to the query
    //console.log(rows);
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' }); // Handle errors appropriately
  }
});

router.post("/api/query/fil", function (req, res) {
  const id = req.body.id; // Assuming ID is sent in the request body
  const genre = req.body.genre;

  console.log("api ha aru");
  const query = `SELECT f.genre,f.f_name,l.like_n 
                 FROM user u,_like l, food f
                 WHERE u.id = ?
                 AND u.id = l.user_id
                 AND l.food_id = f.id
                 AND f.genre LIKE ? `;

  try {
    const rows = db.prepare(query).all(id,genre); // Bind ID to the query
    console.log(rows);
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' }); // Handle errors appropriately
  }
});

router.post("/api/update/data", function (req, res) {
  const id = Number(req.body.id);
  const Index = req.body.rowIndex; // Assuming ID is sent in the request body
  const likeValue = Number(req.body.likeValue);
  
  /*
  console.log(id);
  console.log(typeof(id));
  console.log(Index);
  console.log(typeof(Index));
  console.log(likeValue);
  console.log(typeof(likeValue));
  */
  
  console.log("api ha aru");
  const query = `UPDATE _like
                 SET like_n = ?
                 WHERE user_id = ?
                 AND food_id = ?`;

  try {
    
    const statement = db.prepare(query);
    const result = statement.run(likeValue, id, Index); // Bind parameters to the query
    console.log(result.changes);
    // 更新された行数を取得する場合は result.changes を使用できますが、ここでは特に必要ないのでそのまま成功レスポンスを返す
    res.json({ message: 'Update successful' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' }); // Handle errors appropriately
  }
});



router.post("/api/query/work_task", function (req, res) {

  const query = `select w.task_num,w.task,w.review,w.rec 
                 from student s,work_task w
                 where s.id = w.st_id
                 and student_number = ?
                `;

  try {

    const rows = db.prepare(query).all(req.body.st_number);
    console.log(rows);
    res.json(rows);
  } catch (err) {
    console.log(err);
  }
});

router.get("/api/query/num", function (req, res) {
  const query = `select count(*) as count
                 from work_task
                 where rec = 1`;

  try {
    const rows = db.prepare(query).get();
    console.log(rows);
    res.json({ count: rows.count });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// api.js
router.get("/api/query/board-table", function (req, res) {
  const query = `select s.student_number, s.name, w.task_num
                 from student s, work_task w
                 where s.id = w.st_id
                 and w.rec = 1
                 order by w.task_num`;

  try {
    const rows = db.prepare(query).all();
    console.log(rows);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// api/query/update の実装
router.post('/api/query/update', (req, res) => {
  const stNumber = req.body.st_number;
  const taskNum = req.body.task_num;
  const type = req.body.type;

  // 学生とワークタスクを結合して更新
  const query = `
    UPDATE work_task
    SET
      task = CASE WHEN ? = 'task' AND task = 0 THEN 1
                  WHEN ? = 'task' AND task = 1 THEN 0
                  WHEN ? = 'review' AND review = 0 THEN 1
                  ELSE task END,
      review = CASE WHEN ? = 'review' AND review = 0 THEN 1
                    WHEN ? = 'review' AND review = 1 THEN 0
                    WHEN ? = 'task' AND  task = 1  THEN 0
                    ELSE review END,
      rec = CASE WHEN ? = 'rec' AND task = 1 AND (rec = 0 OR rec IS NULL) AND review = 0 THEN 1
                 WHEN ? = 'rec' AND rec = 1 THEN 0
                 WHEN ? = 'review' AND review = 0 THEN 0 
                 WHEN ? = 'task' AND task = 1 THEN 0
                 ELSE rec END
    WHERE
      st_id = (SELECT id FROM student WHERE student_number = ?)
      AND task_num = ?
  `;

  try {
    const stmt = db.prepare(query);
    const result = stmt.run(
      type, type, type, type,type, type, type, type,type,type, stNumber, taskNum
    );

    if(result.changes === 0){
      res.json({message:'記入ミスか、不可能な処理を行っています。'})
    }
    else res.json({ message: '正しく更新されました。' });
  } catch (err) {
    console.error('Error updating data:', err);
    return res.status(500).json({ error: 'データの更新中にエラーが発生しました' });
  }
});

router.post('/api/query/personal', function (req, res) {
  
  
  const query_task = `
  WITH all_count AS (
      SELECT COUNT(*) AS max_count
      FROM work_task
      WHERE st_id = ?
    )
    SELECT ROUND(COUNT(w.*) * 1.0 / a.max_count, 1) AS task_per
    FROM work_task w, all_count a
    WHERE w.st_id = ? AND w.task = 1`;
  
  const query_review = `
  WITH all_count AS (
      SELECT COUNT(*) AS max_count
      FROM work_task
      WHERE st_id = ?
    )
    SELECT ROUND(COUNT(w.*) * 1.0 / a.max_count, 1) AS review_per
    FROM work_task w, all_count a
    WHERE w.st_id = ? AND w.review = 1`;
  
  const query_rec = `
    WITH all_count AS (
      SELECT COUNT(*) AS max_count
      FROM work_task
      WHERE st_id = ?
    )
    SELECT ROUND(COUNT(w.*) * 1.0 / a.max_count, 1) AS rec_per
    FROM work_task w, all_count a
    WHERE w.st_id = ? AND w.rec = 1`;

  try {
    const stNumber = req.body.st_number;
    const rows1 = db.prepare(query_task).get(stNumber,stNumber);
    const rows2 = db.prepare(query_review).get(stNumber,stNumber);
    const rows3 = db.prepare(query_rec).get(stNumber,stNumber);
    
    console.log(rows1);
    console.log(rows2);
    console.log(rows3);
    
    res.json({
      task: rows1.task_per,
      review: rows2.review_per,
      rec: rows3.rec_per
    });
    
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
