require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const path = require("path");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

const sequelize = require("./config/db");

// Models
const Admin = require("./models/Admin");
const Category = require("./models/Category");
const Product = require("./models/Product");

// Routes
const AdminRoutes = require("./routes/admin.routes");
const AuthRoutes = require("./routes/auth.routes");
const ProductRoutes = require("./routes/product.routes");
const CategoryRoutes = require("./routes/category.routes");

// Middleware bảo vệ admin
const { requireAdmin, isLoggedIn } = require("./middleware/auth");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Multer: dùng memory storage để upload lên Cloudinary trực tiếp
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
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
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "assets")));

// Routes
app.get("/login", isLoggedIn, (req, res) => res.render("login", { error: null }));
app.use("/auth", AuthRoutes);
app.use("/admin", requireAdmin, AdminRoutes);

// API công khai với upload memory
app.use("/v1/products", upload.single("imageFile"), ProductRoutes);
app.use("/v1/categories", CategoryRoutes);

// Trang chủ redirect
app.get("/", requireAdmin, (req, res) => res.redirect("/admin"));

// Trang edit product
app.get("/admin/product/update/:id", requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: { model: Category, as: "category" },
    });
    if (!product) return res.status(404).send("Không tìm thấy sản phẩm");
    res.render("product-edit", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
});

// Tạo admin mặc định
async function createDefaultAdmin() {
  try {
    const [admin, created] = await Admin.findOrCreate({
      where: { name: "admin" },
      defaults: { name: "admin", password: "admin123", role: "admin" },
    });
    if (created) console.log("Tài khoản admin mặc định đã được tạo: admin/admin123");
    else console.log("Admin đã tồn tại");
  } catch (err) {
    console.error("Lỗi tạo admin mặc định:", err);
  }
}

// Khởi động server
sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("Kết nối MySQL thành công!");
    await createDefaultAdmin();
    app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
  })
  .catch((err) => console.error("Lỗi kết nối database:", err));
