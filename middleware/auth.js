// middleware/auth.js
const requireAdmin = (req, res, next) => {
    if (!req.session.admin) {
      return res.redirect('/login');
    }
    next();
  };
  
  const isLoggedIn = (req, res, next) => {
    if (req.session.admin) {
      return res.redirect('/admin');
    }
    next();
  };
  
  module.exports = { requireAdmin, isLoggedIn };