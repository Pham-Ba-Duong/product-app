// server.js
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

let db;

async function connectDB() {
  try {
    const dbUrl = process.env.MYSQL_URL;
    if (!dbUrl) throw new Error("MYSQL_URL chưa được cấu hình trên Railway!");

    db = await mysql.createConnection(dbUrl);
    console.log("✅ Đã kết nối Database MySQL!");
  } catch (err) {
    console.error("❌ Lỗi kết nối Database:", err.message);
  }
}

// Tạo bảng products nếu chưa có
async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// ======================
// CRUD Sản phẩm
// ======================
app.get("/", (req, res) => res.send("🚀 Backend đang chạy!"));

app.get("/products", async (req, res) => {
  try {
    const { search } = req.query;
    let sql = "SELECT * FROM products";
    const params = [];
    if (search) {
      sql += " WHERE name LIKE ? OR description LIKE ?";
      params.push(`%${search}%`, `%${search}%`);
    }
    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/products", async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const [result] = await db.execute(
      "INSERT INTO products (name, description, price) VALUES (?, ?, ?)",
      [name, description, price]
    );
    res.json({ id: result.insertId, name, description, price });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;
    await db.execute(
      "UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?",
      [name, description, price, id]
    );
    res.json({ id, name, description, price });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM products WHERE id = ?", [id]);
    res.json({ message: "Deleted", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================
// Khởi động server
// ======================
async function startServer() {
  await connectDB();
  await initDB();

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));
}

startServer();
