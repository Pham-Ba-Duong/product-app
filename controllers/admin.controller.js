exports.getAdmin = (req, res) => {
  res.render("../views/admin.page.ejs");
};

//Post--------------
exports.getManagePosts = (req, res) => {
  res.render("../views/product-admin.ejs");
};

exports.getManageCreatePost = (req, res) => {
  res.render("../views/product-create.ejs");
};

//Category----------
exports.getManageCategory = (req, res) => {
  res.render("../views/category-admin.ejs");
};

exports.getManageCreateCategory = (req, res) => {
  res.render("../views/category-create.ejs");
};


