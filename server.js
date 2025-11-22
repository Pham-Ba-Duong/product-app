require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const path = require("path");
const cors = require("cors");

const sequelize = require("./config/db");

// Routes
const AdminRoutes = require("./routes/admin.routes");
const AuthRoutes = require("./routes/auth.routes");
const ProductRoutes = require("./routes/product.routes");
const CategoryRoutes = require("./routes/category.routes");

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
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
  })
);

// ===== View Engine =====
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "assets"))); // assets, ckeditor, img, etc.

// ===== Routes =====

// Trang login
app.get("/login", isLoggedIn, (req, res) => {
  res.render("login", { error: null });
});

// Auth routes
app.use("/auth", AuthRoutes);

// Bảo vệ toàn bộ route /admin
app.use("/admin", requireAdmin, AdminRoutes);

// API công khai
app.use("/api/products", ProductRoutes);
app.use("/api/categories", CategoryRoutes);

// Redirect trang chủ
app.get("/", requireAdmin, (req, res) => {
  res.redirect("/admin");
});

// ===== Tạo tài khoản admin mặc định =====
async function createDefaultAdmin() {
  try {
    const [admin, created] = await Admin.findOrCreate({
      where: { name: "admin" },
      defaults: {
        name: "admin",
        password: "admin123", // hash trong model Admin
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
