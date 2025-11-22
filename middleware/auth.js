// Bắt buộc admin đã login mới truy cập
const requireAdmin = (req, res, next) => {
    if (!req.session.admin) {
      return res.redirect('/login');
    }
    next();
  };
  
  // Nếu đã login thì không được vào login page nữa
  const isLoggedIn = (req, res, next) => {
    if (req.session.admin) {
      return res.redirect('/admin');
    }
    next();
  };
  
  module.exports = { requireAdmin, isLoggedIn };
  