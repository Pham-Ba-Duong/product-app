// controllers/auth.controller.js
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
  const { identifier, password } = req.body; // identifier có thể là name hoặc email (tùy bạn sau này)

  try {
    const admin = await Admin.findOne({ where: { name: identifier } });
    if (!admin) {
      return res.render('login', { error: "Tài khoản không tồn tại!" });
    }

    if (admin.role !== "admin") {
      return res.render('login', { error: "Bạn không có quyền truy cập admin!" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.render('login', { error: "Mật khẩu không đúng!" });
    }

    // Đăng nhập thành công → lưu vào session
    req.session.admin = {
      id: admin.id,
      name: admin.name,
      role: admin.role
    };

    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.render('login', { error: "Lỗi server, vui lòng thử lại!" });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};