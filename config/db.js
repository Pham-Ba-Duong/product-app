// config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sequelize config sử dụng đúng biến môi trường Railway
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,   // Tên database trên Railway
  process.env.MYSQLUSER,        // User MySQL
  process.env.MYSQLPASSWORD,    // Password MySQL
  {
    host: process.env.MYSQLHOST,      // Host MySQL
    port: process.env.MYSQLPORT || 3306, // Port MySQL
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
