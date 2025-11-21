require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// 🟢 GET all products
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 🔵 Search product
app.get("/products/search", (req, res) => {
  const q = `%${req.query.q}%`;
  db.query("SELECT * FROM products WHERE name LIKE ?", [q], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 🟡 Add product
app.post("/products", (req, res) => {
  const { name, price, description } = req.body;

  db.query(
    "INSERT INTO products (name, price, description) VALUES (?, ?, ?)",
    [name, price, description],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId, name, price, description });
    }
  );
});

// 🟠 Update product
app.put("/products/:id", (req, res) => {
  const id = req.params.id;
  const { name, price, description } = req.body;

  db.query(
    "UPDATE products SET name=?, price=?, description=? WHERE id=?",
    [name, price, description, id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Updated successfully" });
    }
  );
});

// 🔴 Delete product
app.delete("/products/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM products WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Deleted successfully" });
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on Railway!");
});
