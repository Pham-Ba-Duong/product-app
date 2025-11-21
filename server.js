require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const path = require("path");
const cors = require("cors");

// Database
const sequelize = require("./config/db");

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(methodOverride("_method"));

// Session (phục vụ login với EJS)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
  })
);

// ===== View Engine =====
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// ===== Routes =====
app.use("/auth", authRoutes);
app.use("/products", productRoutes);

// Trang chủ
app.get("/", (req, res) => {
  res.render("index", { user: req.session.user || null });
});

// ===== Start Server =====
sequelize
  .sync({ alter: true }) // Code-first tự tạo bảng
  .then(() => {
    console.log("MySQL connected successfully!");
    app.listen(PORT, () =>
      console.log(`Server running on Railway at port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
