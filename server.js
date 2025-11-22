require("dotenv").config();
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const path = require("path");
const cors = require("cors");

const AdminRoutes = require('./routes/admin.routes');
const CategoryRoutes = require('./routes/category.routes');
const ProductRoutes = require('./routes/product.routes');

// Database
const sequelize = require("./config/db");


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
app.use(expressLayouts);          // enable layouts
app.set("layout", "layout");      // default layout: views/layout.ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));


app.get('/admin', (req, res) => {
  res.render('admin.page.ejs');
})

app.use('/admin', AdminRoutes);
app.use('/', ProductRoutes);
app.use('/', CategoryRoutes);

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
