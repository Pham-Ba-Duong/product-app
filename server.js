require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const path = require("path");
const cors = require("cors");

const sequelize = require("./config/db");

// Routes
const AdminRoutes = require("./routes/admin.routes.js");
const AuthRoutes = require("./routes/auth.routes.js");
const ProductRoutes = require("./routes/product.routes.js");
const CategoryRoutes = require("./routes/category.routes.js");

// Middleware bảo vệ admin
const { requireAdmin, isLoggedIn } = require("./middleware/auth");

// Models
const Admin = require("./models/Admin");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret-key-2025",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,              // Đổi thành true nếu dùng HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 giờ
    }
  })
);

// ===== View Engine =====
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "assets"))); // phục vụ asset-admin, ckeditor, v.v.

// ===== Routes =====

// Trang login (nếu đã login thì tự động về /admin)
app.get("/login", isLoggedIn, (req, res) => {
  res.render("login", { error: null });
});

// Xử lý đăng nhập
app.use("/auth", AuthRoutes);

// Trang logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// Bảo vệ toàn bộ route /admin - bắt buộc phải login + là admin
app.use("/admin", requireAdmin, AdminRoutes);

// API công khai (frontend + mobile có thể dùng)
app.use("/api/products", ProductRoutes);     
app.use("/api/categories", CategoryRoutes);

// Trang chủ admin (bắt buộc đăng nhập)
app.get("/", requireAdmin, (req, res) => {
  res.redirect("/admin");
});

// ===== Tạo tài khoản admin mặc định (chạy 1 lần) =====
async function createDefaultAdmin() {
  try {
    const [admin, created] = await Admin.findOrCreate({
      where: { name: "admin" },
      defaults: {
        name: "admin",
        password: "admin123", // sẽ được hash tự động trong model
        role: "admin"
      }
    });

    if (created) {
      console.log("Tài khoản admin mặc định đã được tạo:");
      console.log("   Username: admin");
      console.log("   Password: admin123");
    } else {
      console.log("Admin đã tồn tại");
    }
  } catch (err) {
    console.error("Lỗi tạo admin mặc định:", err);
  }
}

// ===== Khởi động Server =====
sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("Kết nối MySQL thành công!");

    // Tạo admin mặc định sau khi DB sẵn sàng
    await createDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`Server đang chạy tại: http://localhost:${PORT}`);
      console.log(`Trang admin: http://localhost:${PORT}/admin`);
      console.log(`Đăng nhập: http://localhost:${PORT}/login`);
    });
  })
  .catch((err) => {
    console.error("Lỗi kết nối database:", err);
  });