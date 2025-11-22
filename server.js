require("dotenv").config();
const express = require("express");
// const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const path = require("path");
const cors = require("cors");

const BodyParser = require('body-parser');
const sequelize = require("./config/db");

// Routes
const AdminRoutes = require('./routes/admin.routes.js');
const ProductRoutes = require("./routes/product.routes.js");
const CategoryRoutes = require("./routes/category.routes.js");

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
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
  })
);

// ===== View Engine =====
// app.use(expressLayouts);
// app.set("layout", "layout");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static('assets'));
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

// Trang chủ
app.get("/admin", (req, res) => {
  res.render("admin.page.ejs", { 
    user: req.session.user || null, 
    title: "Admin Dashboard",
    products: [] 
  });
});

// Routes
app.use('/admin', AdminRoutes);
// app.use('/', ProductRoutes);
// app.use('/', CategoryRoutes);

// ===== Start Server =====
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("MySQL connected successfully!");
    app.listen(PORT, () =>
      console.log(`Server running on Railway at port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
